"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { endImpersonation } from "@/lib/actions/admin";

interface ImpersonationBannerProps {
  orgName: string;
  superAdminName: string;
}

export function ImpersonationBanner({ orgName, superAdminName }: ImpersonationBannerProps) {
  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
      <AlertTriangle className="h-4 w-4" />
      <span>
        Impersonating <strong>{orgName}</strong> as {superAdminName}
      </span>
      <form action={endImpersonation} className="inline">
        <Button
          type="submit"
          size="sm"
          variant="outline"
          className="ml-2 h-7 border-amber-700 bg-amber-400 hover:bg-amber-300 text-amber-950"
        >
          End Session
        </Button>
      </form>
    </div>
  );
}
