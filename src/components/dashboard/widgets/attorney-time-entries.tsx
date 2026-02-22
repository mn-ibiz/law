import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Timer } from "lucide-react";
import { APP_LOCALE } from "@/lib/constants/locale";

interface TimeEntry {
  id: string;
  description: string;
  hours: string;
  date: Date;
  caseNumber: string | null;
}

export function AttorneyTimeEntries({ data }: { data: TimeEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Time Entries</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            icon={Timer}
            title="No time entries"
            description="Start logging your time."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Case</th>
                  <th className="pb-2 font-medium">Description</th>
                  <th className="pb-2 font-medium">Hours</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.map((entry) => (
                  <tr key={entry.id} className="border-b last:border-0">
                    <td className="py-2 text-muted-foreground">
                      {entry.caseNumber ?? "—"}
                    </td>
                    <td className="py-2 max-w-48 truncate">
                      {entry.description}
                    </td>
                    <td className="py-2 font-medium">
                      {Number(entry.hours).toFixed(1)}h
                    </td>
                    <td className="py-2 text-muted-foreground">
                      {new Date(entry.date).toLocaleDateString(APP_LOCALE, {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
