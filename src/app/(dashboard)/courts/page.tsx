import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getCourtHierarchy } from "@/lib/queries/courts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function CourtsPage() {
  await requireAdminOrAttorney();
  const hierarchy = await getCourtHierarchy();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Kenya Court Hierarchy</h1>
        <p className="text-muted-foreground">Courts and stations for case filings.</p>
      </div>
      {hierarchy.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              No courts configured. Add courts in Settings to begin tracking filings.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {hierarchy.map((court) => (
            <Card key={court.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{court.name}</CardTitle>
                  <Badge variant="outline">{court.level}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-2 text-sm">
                  {court.jurisdiction && (
                    <div>
                      <dt className="text-muted-foreground">Jurisdiction</dt>
                      <dd className="font-medium">{court.jurisdiction}</dd>
                    </div>
                  )}
                  {court.address && (
                    <div>
                      <dt className="text-muted-foreground">Address</dt>
                      <dd className="font-medium">{court.address}</dd>
                    </div>
                  )}
                </dl>
                {court.stations.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Stations ({court.stations.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {court.stations.map((station) => (
                        <Badge key={station.id} variant="secondary">
                          {station.name}
                          {station.county && ` (${station.county})`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
