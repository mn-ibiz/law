import { AlertTriangle } from "lucide-react";

export function DisciplinaryAlert({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/5 p-4">
      <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
      <div>
        <p className="text-sm font-medium text-destructive">
          Active Disciplinary Proceedings: {count} pending
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Review the Disciplinary tab for details.
        </p>
      </div>
    </div>
  );
}
