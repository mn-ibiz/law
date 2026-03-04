"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Settings, Plus, Trash2 } from "lucide-react";
import { useAction } from "@/hooks/use-action";
import {
  createStageAutomation,
  updateStageAutomation,
  deleteStageAutomation,
  getStageAutomations,
} from "@/lib/actions/pipeline";
import { toast } from "sonner";

interface Automation {
  id: string;
  stageId: string;
  triggerOn: string;
  actionType: string;
  actionConfig: string | null;
  isActive: boolean;
}

export function PipelineStageAutomations({
  stageId,
  stageName,
}: {
  stageId: string;
  stageName: string;
}) {
  const [open, setOpen] = useState(false);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(false);

  // New automation form state
  const [triggerOn, setTriggerOn] = useState<string>("enter");
  const [actionType, setActionType] = useState<string>("send_notification");
  const [configTitle, setConfigTitle] = useState("");
  const [configMessage, setConfigMessage] = useState("");
  const [configStatus, setConfigStatus] = useState("");
  const [configDueDays, setConfigDueDays] = useState("");

  const loadAutomations = async () => {
    setLoading(true);
    try {
      const result = await getStageAutomations(stageId);
      setAutomations(result);
    } catch {
      toast.error("Failed to load automations");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      void loadAutomations();
    }, 0);
    return () => clearTimeout(t);
  }, [open, stageId]); // eslint-disable-line react-hooks/exhaustive-deps

  const { execute: addAutomation, isPending: isAdding } = useAction(
    async () => {
      let config: Record<string, unknown> = {};
      if (actionType === "send_notification") {
        config = { title: configTitle || undefined, message: configMessage || undefined };
      } else if (actionType === "create_task") {
        config = {
          title: configTitle || undefined,
          dueDaysOffset: configDueDays ? parseInt(configDueDays) : undefined,
        };
      } else if (actionType === "update_status") {
        config = { status: configStatus || undefined };
      }
      return createStageAutomation({
        stageId,
        triggerOn,
        actionType,
        actionConfig: JSON.stringify(config),
        isActive: true,
      });
    },
    {
      successMessage: "Automation added",
      onSuccess: () => {
        setConfigTitle("");
        setConfigMessage("");
        setConfigStatus("");
        setConfigDueDays("");
        loadAutomations();
      },
    }
  );

  const handleDelete = async (id: string) => {
    const result = await deleteStageAutomation(id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Automation deleted");
      loadAutomations();
    }
  };

  const handleToggleActive = async (automation: Automation) => {
    const result = await updateStageAutomation(automation.id, {
      ...automation,
      isActive: !automation.isActive,
    });
    if (result?.error) {
      toast.error(result.error);
    } else {
      loadAutomations();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          title="Stage automations"
        >
          <Settings className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Automations — {stageName}</DialogTitle>
        </DialogHeader>

        {/* Existing automations */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
          ) : automations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No automations configured
            </p>
          ) : (
            automations.map((a) => {
              const config = a.actionConfig ? JSON.parse(a.actionConfig) : {};
              return (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-md border p-2 text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-medium capitalize">{a.triggerOn}</span>
                    {" → "}
                    <span className="text-muted-foreground">
                      {a.actionType.replace(/_/g, " ")}
                    </span>
                    {config.title && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({config.title})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <Switch
                      checked={a.isActive}
                      onCheckedChange={() => handleToggleActive(a)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => handleDelete(a.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add new automation */}
        <div className="border-t pt-4 space-y-3">
          <p className="text-sm font-medium flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Automation
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Trigger</Label>
              <Select value={triggerOn} onValueChange={setTriggerOn}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enter">On Enter</SelectItem>
                  <SelectItem value="exit">On Exit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Action</Label>
              <Select value={actionType} onValueChange={setActionType}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="send_notification">Send Notification</SelectItem>
                  <SelectItem value="create_task">Create Task</SelectItem>
                  <SelectItem value="update_status">Update Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(actionType === "send_notification" || actionType === "create_task") && (
            <div className="space-y-1">
              <Label className="text-xs">Title</Label>
              <Input
                value={configTitle}
                onChange={(e) => setConfigTitle(e.target.value)}
                className="h-8 text-xs"
                placeholder="e.g., Case moved to Trial"
              />
            </div>
          )}

          {actionType === "send_notification" && (
            <div className="space-y-1">
              <Label className="text-xs">Message</Label>
              <Input
                value={configMessage}
                onChange={(e) => setConfigMessage(e.target.value)}
                className="h-8 text-xs"
                placeholder="Notification message"
              />
            </div>
          )}

          {actionType === "create_task" && (
            <div className="space-y-1">
              <Label className="text-xs">Due in (days)</Label>
              <Input
                type="number"
                value={configDueDays}
                onChange={(e) => setConfigDueDays(e.target.value)}
                className="h-8 text-xs"
                placeholder="e.g., 7"
              />
            </div>
          )}

          {actionType === "update_status" && (
            <div className="space-y-1">
              <Label className="text-xs">New Status</Label>
              <Select value={configStatus} onValueChange={setConfigStatus}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="hearing">Hearing</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            size="sm"
            className="w-full"
            onClick={() => addAutomation(undefined as never)}
            disabled={isAdding}
          >
            {isAdding ? "Adding..." : "Add Automation"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
