import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, AlertTriangle, Award, GraduationCap, ChevronRight } from "lucide-react";
import { getExpiringCertificates, getNonCompliantCpdAttorneys } from "@/lib/queries/compliance";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { formatRelativeDate } from "@/lib/utils/format";
import { requireOrg } from "@/lib/auth/get-session";
import Link from "next/link";

export async function ComplianceWidget() {
  const { organizationId } = await requireOrg();
  const [expiring, nonCompliant] = await Promise.all([
    getExpiringCertificates(organizationId, 60),
    getNonCompliantCpdAttorneys(organizationId),
  ]);

  const hasIssues = expiring.length > 0 || nonCompliant.length > 0;
  const totalIssues = expiring.length + nonCompliant.length;

  return (
    <Card className="h-full shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                hasIssues
                  ? "bg-gradient-to-br from-amber-500 to-orange-500"
                  : "bg-gradient-to-br from-emerald-500 to-teal-500"
              }`}
            >
              {hasIssues ? (
                <AlertTriangle className="h-5 w-5 text-white" />
              ) : (
                <ShieldCheck className="h-5 w-5 text-white" />
              )}
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Compliance</CardTitle>
              <p className="text-xs text-muted-foreground">Certificate & CPD status</p>
            </div>
          </div>
          {hasIssues && (
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 border-amber-200 text-xs font-semibold tabular-nums">
              {totalIssues} {totalIssues === 1 ? "issue" : "issues"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!hasIssues ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
              <ShieldCheck className="h-7 w-7 text-emerald-600" />
            </div>
            <p className="font-semibold text-emerald-700 dark:text-emerald-400">All Compliant</p>
            <p className="mt-1 text-xs text-muted-foreground">
              No certificate or CPD issues found.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Expiring Certificates */}
            {expiring.length > 0 && (
              <div className="rounded-lg border border-rose-200/60 bg-rose-50/50 p-3 dark:border-rose-500/20 dark:bg-rose-500/5">
                <div className="mb-2.5 flex items-center gap-2">
                  <Award className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                    Expiring Certificates
                  </span>
                  <Badge variant="secondary" className="ml-auto h-5 bg-rose-100 px-1.5 text-[10px] font-bold text-rose-700 dark:bg-rose-500/20 dark:text-rose-400">
                    {expiring.length}
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  {expiring.slice(0, 3).map((cert) => (
                    <div
                      key={cert.attorneyId + cert.year}
                      className="flex items-center justify-between rounded-md bg-white/80 px-2.5 py-1.5 text-sm dark:bg-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <PersonAvatar name={cert.attorneyName} imageUrl={cert.attorneyPhotoUrl} size="sm" />
                        <span className="font-medium text-foreground">{cert.attorneyName}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                        {cert.expiryDate
                          ? formatRelativeDate(new Date(cert.expiryDate))
                          : "N/A"}
                      </span>
                    </div>
                  ))}
                  {expiring.length > 3 && (
                    <Link
                      href="/attorneys"
                      className="flex items-center justify-center gap-1 pt-1 text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400"
                    >
                      +{expiring.length - 3} more
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* CPD Non-Compliant */}
            {nonCompliant.length > 0 && (
              <div className="rounded-lg border border-amber-200/60 bg-amber-50/50 p-3 dark:border-amber-500/20 dark:bg-amber-500/5">
                <div className="mb-2.5 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                    CPD Non-Compliant
                  </span>
                  <Badge variant="secondary" className="ml-auto h-5 bg-amber-100 px-1.5 text-[10px] font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                    {nonCompliant.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {nonCompliant.slice(0, 3).map((atty) => {
                    const pct = Math.round((Number(atty.total_units) / 5) * 100);
                    return (
                      <div
                        key={atty.attorney_id}
                        className="rounded-md bg-white/80 px-2.5 py-2 dark:bg-white/5"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <PersonAvatar name={atty.attorney_name} imageUrl={atty.attorney_photo_url} size="sm" />
                            <span className="font-medium text-foreground">{atty.attorney_name}</span>
                          </div>
                          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                            {atty.total_units}/5 units
                          </span>
                        </div>
                        <Progress
                          value={pct}
                          className="mt-1.5 h-1.5 [&>div]:bg-amber-500"
                        />
                      </div>
                    );
                  })}
                  {nonCompliant.length > 3 && (
                    <Link
                      href="/attorneys"
                      className="flex items-center justify-center gap-1 pt-1 text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400"
                    >
                      +{nonCompliant.length - 3} more
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
