import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ShieldCheck } from "lucide-react";
import { getExpiringCertificates, getNonCompliantCpdAttorneys } from "@/lib/queries/compliance";
import { formatRelativeDate } from "@/lib/utils/format";

export async function ComplianceWidget() {
  const [expiring, nonCompliant] = await Promise.all([
    getExpiringCertificates(60),
    getNonCompliantCpdAttorneys(),
  ]);

  const hasIssues = expiring.length > 0 || nonCompliant.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Compliance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasIssues ? (
          <EmptyState
            icon={ShieldCheck}
            title="All compliant"
            description="No certificate or CPD issues."
          />
        ) : (
          <div className="space-y-4">
            {expiring.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Expiring Certificates</h4>
                <div className="space-y-2">
                  {expiring.slice(0, 5).map((cert) => (
                    <div
                      key={cert.attorneyId + cert.year}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{cert.attorneyName}</span>
                      <Badge variant="destructive" className="text-xs">
                        {cert.expiryDate
                          ? formatRelativeDate(new Date(cert.expiryDate))
                          : "N/A"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {nonCompliant.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">CPD Non-Compliant</h4>
                <div className="space-y-2">
                  {nonCompliant.slice(0, 5).map((atty) => (
                    <div
                      key={atty.attorney_id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{atty.attorney_name}</span>
                      <span className="text-xs text-muted-foreground">
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
