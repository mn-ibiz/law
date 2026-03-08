import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getOrganizationDetail } from "@/lib/queries/admin";
import { suspendOrganization, reactivateOrganization, startImpersonation } from "@/lib/actions/admin";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Users, Briefcase, HardDrive, UserCog } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organization Detail - Platform Admin",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrganizationDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await getOrganizationDetail(id);

  if (!data) notFound();

  const { org, subscription, plan, userCount, caseCount, recentAudit } = data;
  const storageMb = Math.round(org.storageUsedBytes / (1024 * 1024));

  async function handleSuspend() {
    "use server";
    await suspendOrganization(id);
  }

  async function handleReactivate() {
    "use server";
    await reactivateOrganization(id);
  }

  async function handleImpersonate() {
    "use server";
    const result = await startImpersonation(id);
    if (result.success && result.slug) {
      redirect("/dashboard");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/organizations">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight">{org.name}</h2>
          <p className="text-muted-foreground">{org.slug} &middot; {org.country}</p>
        </div>
        <div className="flex gap-2">
          <form action={handleImpersonate}>
            <Button variant="outline" size="sm">
              <UserCog className="h-4 w-4 mr-1" /> Impersonate
            </Button>
          </form>
          {org.status === "active" ? (
            <form action={handleSuspend}>
              <Button variant="destructive" size="sm">
                Suspend
              </Button>
            </form>
          ) : org.status === "suspended" ? (
            <form action={handleReactivate}>
              <Button variant="default" size="sm">
                Reactivate
              </Button>
            </form>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-sm font-medium ${
                org.status === "active"
                  ? "bg-green-100 text-green-800"
                  : org.status === "suspended"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
              }`}
            >
              {org.status}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cases</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{caseCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storageMb} MB</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Organization Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{org.email ?? "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span>{org.phone ?? "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">City</span>
              <span>{org.city ?? "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Country</span>
              <span>{org.country}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Currency</span>
              <span>{org.currency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Timezone</span>
              <span>{org.timezone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{new Date(org.createdAt).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {subscription ? (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium">{plan?.name ?? "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      subscription.status === "active"
                        ? "bg-green-100 text-green-800"
                        : subscription.status === "trialing"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {subscription.status}
                  </span>
                </div>
                {subscription.currentPeriodEnd && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Period End</span>
                    <span>{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
                  </div>
                )}
                {subscription.trialEnd && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trial End</span>
                    <span>{new Date(subscription.trialEnd).toLocaleDateString()}</span>
                  </div>
                )}
                {plan && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Users</span>
                      <span>{plan.maxUsers ?? "Unlimited"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Cases</span>
                      <span>{plan.maxCases ?? "Unlimited"}</span>
                    </div>
                  </>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">No active subscription.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Audit Log</CardTitle>
        </CardHeader>
        <CardContent>
          {recentAudit.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No audit entries.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">Action</th>
                    <th className="pb-2 font-medium">Entity</th>
                    <th className="pb-2 font-medium">Details</th>
                    <th className="pb-2 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAudit.map((entry) => (
                    <tr key={entry.id} className="border-b last:border-0">
                      <td className="py-2">{entry.action}</td>
                      <td className="py-2 text-muted-foreground">{entry.entityType}</td>
                      <td className="py-2 text-muted-foreground max-w-xs truncate">
                        {entry.details ?? ""}
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
