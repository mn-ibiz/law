import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrganizationList } from "@/lib/queries/admin";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organizations - Platform Admin",
};

interface Props {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function OrganizationsPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params.search ?? "";
  const status = params.status ?? "";
  const page = parseInt(params.page ?? "1", 10) || 1;

  const result = await getOrganizationList({
    search: search || undefined,
    status: status || undefined,
    page,
    pageSize: 20,
  });

  const totalPages = Math.ceil(result.total / result.pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Organizations</h2>
        <p className="text-muted-foreground">
          Manage all tenant organizations on the platform.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {result.total} organization{result.total !== 1 ? "s" : ""}
          </CardTitle>
          <div className="flex flex-wrap gap-2 pt-2">
            <form className="flex gap-2">
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search by name or slug..."
                className="rounded-md border px-3 py-1.5 text-sm"
              />
              <select
                name="status"
                defaultValue={status}
                className="rounded-md border px-3 py-1.5 text-sm"
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="cancelled">Cancelled</option>
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
          {result.orgs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No organizations found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">Organization</th>
                    <th className="pb-2 font-medium">Slug</th>
                    <th className="pb-2 font-medium">Plan</th>
                    <th className="pb-2 font-medium">Users</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {result.orgs.map((org) => (
                    <tr key={org.id} className="border-b last:border-0">
                      <td className="py-3">
                        <Link
                          href={`/admin/organizations/${org.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {org.name}
                        </Link>
                      </td>
                      <td className="py-3 text-muted-foreground">{org.slug}</td>
                      <td className="py-3">{org.planName}</td>
                      <td className="py-3">{org.userCount}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            org.status === "active"
                              ? "bg-green-100 text-green-800"
                              : org.status === "suspended"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {org.status}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(org.createdAt).toLocaleDateString()}
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
                  href={`/admin/organizations?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}&page=${p}`}
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
