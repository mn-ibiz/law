import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlatformAuditLog } from "@/lib/queries/admin";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit Log - Platform Admin",
};

interface Props {
  searchParams: Promise<{
    action?: string;
    page?: string;
  }>;
}

const ACTIONS = [
  "suspend_org",
  "reactivate_org",
  "impersonate_start",
  "impersonate_end",
  "update_org",
  "create_plan",
  "update_plan",
];

function formatAction(action: string): string {
  return action
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function AuditPage({ searchParams }: Props) {
  const params = await searchParams;
  const action = params.action ?? "";
  const page = parseInt(params.page ?? "1", 10) || 1;

  const result = await getPlatformAuditLog({
    action: action || undefined,
    page,
    pageSize: 50,
  });

  const totalPages = Math.ceil(result.total / result.pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Platform Audit Log</h2>
        <p className="text-muted-foreground">
          All super-admin actions and platform events.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{result.total} entries</CardTitle>
            <form className="flex gap-2">
              <select
                name="action"
                defaultValue={action}
                className="rounded-md border px-3 py-1.5 text-sm"
              >
                <option value="">All actions</option>
                {ACTIONS.map((a) => (
                  <option key={a} value={a}>
                    {formatAction(a)}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
              >
                Filter
              </button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          {result.entries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No audit entries found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">Action</th>
                    <th className="pb-2 font-medium">Actor</th>
                    <th className="pb-2 font-medium">Target Org</th>
                    <th className="pb-2 font-medium">Details</th>
                    <th className="pb-2 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {result.entries.map((entry) => (
                    <tr key={entry.id} className="border-b last:border-0">
                      <td className="py-2">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                          {formatAction(entry.action)}
                        </span>
                      </td>
                      <td className="py-2">
                        <div>
                          <span className="font-medium">{entry.userName}</span>
                          {entry.userEmail && (
                            <span className="text-muted-foreground ml-1">({entry.userEmail})</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2">
                        {entry.targetOrgName ? (
                          <Link
                            href={`/admin/organizations/${entry.targetOrgId}`}
                            className="text-primary hover:underline"
                          >
                            {entry.targetOrgName}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-2 text-muted-foreground max-w-xs truncate">
                        {entry.details ?? ""}
                      </td>
                      <td className="py-2 text-muted-foreground whitespace-nowrap">
                        {new Date(entry.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/admin/audit?action=${encodeURIComponent(action)}&page=${p}`}
                  className={`rounded-md px-3 py-1 text-sm ${
                    p === page
                      ? "bg-primary text-primary-foreground"
                      : "border hover:bg-muted"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
