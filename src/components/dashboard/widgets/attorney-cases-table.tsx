import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Briefcase } from "lucide-react";

interface AttorneyCase {
  id: string;
  caseNumber: string;
  title: string;
  status: string;
  clientName: string;
}

export function AttorneyCasesTable({ data }: { data: AttorneyCase[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">My Cases</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No assigned cases"
            description="You have no active case assignments."
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
                        {c.status.replace("_", " ")}
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
