"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { archiveCase } from "@/lib/actions/cases";
import { Button } from "@/components/ui/button";
import { Archive } from "lucide-react";

interface ArchiveCaseButtonProps {
  caseId: string;
}

export function ArchiveCaseButton({ caseId }: ArchiveCaseButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleArchive() {
    if (!confirm("Are you sure you want to archive this case? The status will be set to closed.")) {
      return;
    }

    setLoading(true);
    try {
      const result = await archiveCase(caseId);
      if (result?.error) {
        toast.error(result.error as string);
      } else {
        toast.success("Case archived");
        router.refresh();
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full text-destructive hover:text-destructive"
      onClick={handleArchive}
      disabled={loading}
    >
      <Archive className="mr-1.5 h-3.5 w-3.5" />
      {loading ? "Archiving..." : "Archive Case"}
    </Button>
  );
}
