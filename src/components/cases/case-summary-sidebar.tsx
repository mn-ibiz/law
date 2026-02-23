import Link from "next/link";
import { Pencil, Receipt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CaseStatusBadge, PriorityBadge } from "@/components/shared/status-badges";
import { formatKES } from "@/lib/utils/format";
import { formatEnum } from "@/lib/utils/format-enum";
import { APP_LOCALE } from "@/lib/constants/locale";

interface Assignment {
  id: string;
  role: string;
  userName: string | null;
}

interface CaseData {
  id: string;
  caseNumber: string;
  title: string;
  status: string;
  priority: string;
  caseType: string;
  practiceArea: string | null;
  billingType: string;
  hourlyRate: string | null;
  flatFeeAmount: string | null;
  contingencyPercentage: string | null;
  estimatedValue: string | null;
  dateFiled: Date | null;
  statuteOfLimitations: Date | null;
  clientId: string;
  clientName: string;
}

interface CaseSummarySidebarProps {
  caseData: CaseData;
  assignments: Assignment[];
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-right truncate">{children}</span>
    </div>
  );
}

function billingAmount(caseData: CaseData): string | null {
  if (caseData.hourlyRate) return `${formatKES(Number(caseData.hourlyRate))}/hr`;
  if (caseData.flatFeeAmount) return formatKES(Number(caseData.flatFeeAmount));
  if (caseData.contingencyPercentage) return `${caseData.contingencyPercentage}%`;
  return null;
}

export function CaseSummarySidebar({ caseData, assignments }: CaseSummarySidebarProps) {
  const amount = billingAmount(caseData);

  return (
    <Card className="sticky top-6">
      <CardContent className="p-5 space-y-4">
        {/* Status & Priority */}
        <div className="flex items-center gap-2 flex-wrap">
          <CaseStatusBadge status={caseData.status} />
          <PriorityBadge priority={caseData.priority} />
        </div>

        <Separator />

        {/* Key Info */}
        <div className="space-y-2.5">
          <InfoRow label="Client">
            <Link href={`/clients/${caseData.clientId}`} className="text-primary hover:underline">
              {caseData.clientName}
            </Link>
          </InfoRow>
          <InfoRow label="Case #">
            <span className="font-mono text-xs">{caseData.caseNumber}</span>
          </InfoRow>
          <InfoRow label="Type">{formatEnum(caseData.caseType)}</InfoRow>
          {caseData.practiceArea && (
            <InfoRow label="Practice Area">{caseData.practiceArea}</InfoRow>
          )}
        </div>

        <Separator />

        {/* Dates */}
        <div className="space-y-2.5">
          {caseData.dateFiled && (
            <InfoRow label="Filed">
              {new Date(caseData.dateFiled).toLocaleDateString(APP_LOCALE)}
            </InfoRow>
          )}
          {caseData.statuteOfLimitations && (
            <InfoRow label="Limitation">
              {new Date(caseData.statuteOfLimitations).toLocaleDateString(APP_LOCALE)}
            </InfoRow>
          )}
        </div>

        {(caseData.dateFiled || caseData.statuteOfLimitations) && <Separator />}

        {/* Billing */}
        <div className="space-y-2.5">
          <InfoRow label="Billing">{formatEnum(caseData.billingType)}</InfoRow>
          {amount && <InfoRow label="Amount">{amount}</InfoRow>}
          {caseData.estimatedValue && (
            <InfoRow label="Est. Value">
              {formatKES(Number(caseData.estimatedValue))}
            </InfoRow>
          )}
        </div>

        {/* Team */}
        {assignments.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Team
              </p>
              <div className="flex flex-wrap gap-2">
                {assignments.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-2 rounded-full bg-muted px-2.5 py-1"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {(a.userName ?? "?").charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium">{a.userName}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatEnum(a.role)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/cases/${caseData.id}/edit`}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/billing?caseId=${caseData.id}`}>
              <Receipt className="mr-1.5 h-3.5 w-3.5" />
              Billing
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
