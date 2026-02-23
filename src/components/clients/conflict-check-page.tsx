"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { searchConflicts, type ConflictResult } from "@/lib/actions/conflicts";
import { Search, Loader2, AlertTriangle, CheckCircle, Shield } from "lucide-react";
import { formatEnum } from "@/lib/utils/format-enum";
import { cn } from "@/lib/utils";

const capsule =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-none whitespace-nowrap";

const severityStyles: Record<string, string> = {
  none: "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/20",
  low: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  medium: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  high: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20",
};

export function ConflictCheckPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ConflictResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [searching, startSearch] = useTransition();

  function handleSearch() {
    if (query.length < 2) return;
    startSearch(async () => {
      const res = await searchConflicts(query);
      setResults(res);
      setSearched(true);
    });
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Search for Conflicts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search by name, company, or party name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="max-w-lg"
          />
          <Button onClick={handleSearch} disabled={searching || query.length < 2}>
            {searching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            Search
          </Button>
        </div>

        {searched && (
          <div className="space-y-3">
            {results.length === 0 ? (
              <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-4 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
                <CheckCircle className="h-5 w-5" />
                <div>
                  <p className="font-medium">No conflicts found</p>
                  <p className="text-sm">No matching records found for &quot;{query}&quot;.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  <AlertTriangle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">
                      {results.length} potential match{results.length !== 1 ? "es" : ""} found
                    </p>
                    <p className="text-sm">Review the results below for conflicts of interest.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {results.map((r, i) => (
                    <div
                      key={`${r.entityId}-${i}`}
                      className="flex items-center justify-between rounded-md border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{r.entityName}</p>
                        <p className="text-sm text-muted-foreground">
                          {r.matchType}
                          {r.caseReference && ` — Case ${r.caseReference}`}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          Type: {formatEnum(r.entityType)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          capsule,
                          severityStyles[r.severity] ?? severityStyles.none
                        )}
                      >
                        {r.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
