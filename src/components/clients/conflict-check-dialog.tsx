"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { searchConflicts, resolveConflict, type ConflictResult } from "@/lib/actions/conflicts";
import { toast } from "sonner";
import { Search, Loader2, AlertTriangle, CheckCircle } from "lucide-react";

interface ConflictCheckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
}

const severityVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  none: "secondary",
  low: "outline",
  medium: "default",
  high: "destructive",
};

export function ConflictCheckDialog({
  open,
  onOpenChange,
  clientId,
  clientName,
}: ConflictCheckDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ConflictResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [searching, startSearch] = useTransition();
  const [resolving, startResolve] = useTransition();
  const [resolution, setResolution] = useState<"clear" | "potential" | "conflict_found">("clear");
  const [notes, setNotes] = useState("");

  function handleSearch() {
    if (query.length < 2) return;
    startSearch(async () => {
      const res = await searchConflicts(query);
      setResults(res);
      setSearched(true);
    });
  }

  function handleResolve() {
    startResolve(async () => {
      const res = await resolveConflict(clientId, query, resolution, notes || undefined);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Conflict check resolved");
      onOpenChange(false);
      setQuery("");
      setResults([]);
      setSearched(false);
      setNotes("");
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Conflict Check</DialogTitle>
          <DialogDescription>
            Search for potential conflicts of interest for {clientName}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search name, company, or party..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={searching || query.length < 2}>
              {searching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {searched && (
            <div className="space-y-3">
              {results.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  No conflicts found for &quot;{query}&quot;.
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                    {results.length} potential match{results.length !== 1 ? "es" : ""} found.
                  </div>
                  <div className="space-y-2">
                    {results.map((r, i) => (
                      <div
                        key={`${r.entityId}-${i}`}
                        className="flex items-center justify-between rounded-md border p-3"
                      >
                        <div>
                          <p className="font-medium">{r.entityName}</p>
                          <p className="text-sm text-muted-foreground">
                            {r.matchType}
                            {r.caseReference && ` — Case ${r.caseReference}`}
                          </p>
                        </div>
                        <Badge variant={severityVariant[r.severity]}>
                          {r.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="border-t pt-4 space-y-3">
                <div className="space-y-2">
                  <Label>Resolution</Label>
                  <Select
                    value={resolution}
                    onValueChange={(v) => setResolution(v as typeof resolution)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clear">Clear — No conflict</SelectItem>
                      <SelectItem value="potential">Potential — Needs review</SelectItem>
                      <SelectItem value="conflict_found">Conflict Found</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add resolution notes..."
                    rows={3}
                  />
                </div>

                <Button onClick={handleResolve} disabled={resolving} className="w-full">
                  {resolving ? "Saving..." : "Record Resolution"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
