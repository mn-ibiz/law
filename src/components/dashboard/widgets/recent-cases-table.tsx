import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Briefcase } from "lucide-react";
import { formatEnum } from "@/lib/utils/format-enum";

interface RecentCase {
  id: string;
  caseNumber: string;
  title: string;
  status: string;
  clientName: string;
  createdAt: Date;
}

export function RecentCasesTable({ data }: { data: RecentCase[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Cases</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No cases yet"
            description="Cases will appear here once created."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Case #</th>
                  <th className="pb-2 font-medium">Title</th>
                  <th className="pb-2 font-medium">Client</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="py-2">
                      <Link
                        href={`/cases/${c.id}`}
                        className="text-primary hover:underline"
                      >
                        {c.caseNumber}
                      </Link>
                    </td>
                    <td className="py-2 max-w-48 truncate">{c.title}</td>
                    <td className="py-2">{c.clientName}</td>
                    <td className="py-2">
                      <Badge variant="outline" className="capitalize text-xs">
                        {formatEnum(c.status)}
                      </Badge>
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
