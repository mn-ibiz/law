"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "@/hooks/use-action";
import { createApiKey, revokeApiKey } from "@/lib/actions/api-keys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Copy, Check, Trash2 } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: string[];
  lastUsedAt: Date | string | null;
  expiresAt: Date | string | null;
  revokedAt: Date | string | null;
  createdAt: Date | string;
  status: string;
}

const AVAILABLE_PERMISSIONS = [
  { value: "cases:read", label: "Read Cases" },
  { value: "cases:write", label: "Write Cases" },
  { value: "clients:read", label: "Read Clients" },
  { value: "clients:write", label: "Write Clients" },
  { value: "billing:read", label: "Read Billing" },
  { value: "documents:read", label: "Read Documents" },
] as const;

export function ApiKeyManager({ initialKeys }: { initialKeys: ApiKey[] }) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [expiresAt, setExpiresAt] = useState("");

  const { execute: doCreate, isPending: isCreating } = useAction(
    (data: unknown) => createApiKey(data),
    {
      successMessage: "API key created",
      onSuccess: (data) => {
        const result = data as { key?: string } | undefined;
        if (result?.key) {
          setNewKeyValue(result.key);
        }
        router.refresh();
      },
    }
  );

  const { execute: doRevoke, isPending: isRevoking } = useAction(
    (keyId: string) => revokeApiKey(keyId),
    {
      successMessage: "API key revoked",
      onSuccess: () => router.refresh(),
    }
  );

  function handleCreate() {
    if (!name.trim() || selectedPermissions.length === 0) return;
    doCreate({
      name: name.trim(),
      permissions: selectedPermissions,
      expiresAt: expiresAt || undefined,
    });
  }

  function handleCopy() {
    if (newKeyValue) {
      navigator.clipboard.writeText(newKeyValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleCloseCreate() {
    setShowCreate(false);
    setNewKeyValue(null);
    setName("");
    setSelectedPermissions([]);
    setExpiresAt("");
    setCopied(false);
  }

  function togglePermission(perm: string) {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  }

  const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
    active: "default",
    expired: "secondary",
    revoked: "destructive",
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={showCreate} onOpenChange={(open) => open ? setShowCreate(true) : handleCloseCreate()}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            {newKeyValue ? (
              <>
                <DialogHeader>
                  <DialogTitle>API Key Created</DialogTitle>
                  <DialogDescription>
                    Copy the key now. It will not be shown again.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-muted p-3 text-xs break-all font-mono">
                    {newKeyValue}
                  </code>
                  <Button variant="outline" size="icon" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <DialogFooter>
                  <Button onClick={handleCloseCreate}>Done</Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Create API Key</DialogTitle>
                  <DialogDescription>
                    Generate a new API key for external integrations.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="key-name">Name</Label>
                    <Input
                      id="key-name"
                      placeholder="e.g. CRM Integration"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Permissions</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {AVAILABLE_PERMISSIONS.map((perm) => (
                        <label
                          key={perm.value}
                          className="flex items-center gap-2 rounded border p-2 text-sm cursor-pointer hover:bg-muted/50"
                        >
                          <Checkbox
                            checked={selectedPermissions.includes(perm.value)}
                            onCheckedChange={() => togglePermission(perm.value)}
                          />
                          {perm.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="key-expires">Expires (optional)</Label>
                    <Input
                      id="key-expires"
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => {
                        if (!e.target.value) {
                          setExpiresAt("");
                          return;
                        }
                        try {
                          setExpiresAt(new Date(e.target.value).toISOString());
                        } catch {
                          setExpiresAt("");
                        }
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleCloseCreate}>Cancel</Button>
                  <Button
                    onClick={handleCreate}
                    disabled={isCreating || !name.trim() || selectedPermissions.length === 0}
                  >
                    {isCreating ? "Creating..." : "Create Key"}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {initialKeys.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">No API keys yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell>
                    <code className="text-xs font-mono">lfr_{key.keyPrefix}...</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[key.status] ?? "secondary"} className="capitalize">
                      {key.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {key.permissions.slice(0, 3).map((p) => (
                        <Badge key={p} variant="outline" className="text-xs">
                          {p}
                        </Badge>
                      ))}
                      {key.permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{key.permissions.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : "Never"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(key.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {key.status === "active" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will immediately revoke &quot;{key.name}&quot;. Any integrations using this key will stop working.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => doRevoke(key.id)}
                              disabled={isRevoking}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {isRevoking ? "Revoking..." : "Revoke Key"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
