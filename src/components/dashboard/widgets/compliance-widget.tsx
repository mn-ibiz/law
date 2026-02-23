import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { getExpiringCertificates, getNonCompliantCpdAttorneys } from "@/lib/queries/compliance";
import { formatRelativeDate } from "@/lib/utils/format";

export async function ComplianceWidget() {
  const [expiring, nonCompliant] = await Promise.all([
    getExpiringCertificates(60),
    getNonCompliantCpdAttorneys(),
  ]);

  const hasIssues = expiring.length > 0 || nonCompliant.length > 0;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Compliance Overview</CardTitle>
            <CardDescription className="text-xs">Certificate &amp; CPD status</CardDescription>
          </div>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              hasIssues ? "bg-amber-500/10" : "bg-emerald-500/10"
            }`}
          >
            {hasIssues ? (
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            ) : (
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!hasIssues ? (
          <EmptyState
            icon={ShieldCheck}
            title="All compliant"
            description="No certificate or CPD issues."
          />
        ) : (
          <div className="space-y-5">
            {expiring.length > 0 && (
              <div>
                <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Expiring Certificates
                </h4>
                <div className="space-y-2">
                  {expiring.slice(0, 5).map((cert) => (
                    <div
                      key={cert.attorneyId + cert.year}
                      className="flex items-center justify-between rounded-lg border border-transparent p-2 text-sm transition-colors hover:border-border hover:bg-muted/50"
                    >
                      <span className="font-medium">{cert.attorneyName}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/20">
                        {cert.expiryDate
                          ? formatRelativeDate(new Date(cert.expiryDate))
                          : "N/A"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {nonCompliant.length > 0 && (
              <div>
                <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  CPD Non-Compliant
                </h4>
                <div className="space-y-2">
                  {nonCompliant.slice(0, 5).map((atty) => (
                    <div
                      key={atty.attorney_id}
                      className="flex items-center justify-between rounded-lg border border-transparent p-2 text-sm transition-colors hover:border-border hover:bg-muted/50"
                    >
                      <span className="font-medium">{atty.attorney_name}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        {atty.total_units}/5 units
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
