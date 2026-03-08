"use client";

import { useActionFn } from "@/hooks/use-action";
import { exportDataAction } from "@/lib/actions/data-export";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

export function DataExportButton() {
  const { execute, isPending } = useActionFn(
    async () => {
      const result = await exportDataAction();
      const typed = result as { success?: boolean; data?: string; filename?: string; error?: string };

      if (typed.error) return { error: typed.error };

      if (typed.data && typed.filename) {
        const blob = new Blob([typed.data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = typed.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      return { success: true };
    },
    { successMessage: "Data exported successfully" }
  );

  return (
    <Button onClick={execute} disabled={isPending} variant="outline" size="sm">
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      {isPending ? "Exporting..." : "Export All Data"}
    </Button>
  );
}
