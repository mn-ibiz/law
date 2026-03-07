import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireOrg } from "@/lib/auth/get-session";
import { getBranchWithUsers } from "@/lib/queries/settings";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Users,
} from "lucide-react";
import { APP_LOCALE } from "@/lib/constants/locale";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { organizationId } = await requireOrg();
  const { id } = await params;
  const branch = await getBranchWithUsers(organizationId, id);
  return {
    title: branch ? branch.name : "Branch Details",
    description: branch
      ? `Details for ${branch.name} branch office`
      : "Branch office details",
  };
}

export default async function BranchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { organizationId } = await requireOrg();
  const { id } = await params;
  const branch = await getBranchWithUsers(organizationId, id);
  if (!branch) notFound();

  const location = [branch.address, branch.city, branch.county]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        items={[
          { label: "Branches", href: "/settings/branches" },
          { label: branch.name },
        ]}
      />

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{branch.name}</h1>
          {location && (
            <p className="text-sm text-muted-foreground">{location}</p>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {branch.isMain ? (
            <Badge>Head Office</Badge>
          ) : (
            <Badge variant="outline">Branch</Badge>
          )}
          <Badge variant={branch.isActive ? "default" : "secondary"}>
            {branch.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <DetailRow label="Address" value={branch.address} />
            <DetailRow label="City" value={branch.city} />
            <DetailRow label="County" value={branch.county} />
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {branch.phone ? (
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{branch.phone}</span>
              </div>
            ) : (
              <DetailRow label="Phone" value={null} />
            )}
            {branch.email ? (
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{branch.email}</span>
              </div>
            ) : (
              <DetailRow label="Email" value={null} />
            )}
            <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                Created{" "}
                {new Date(branch.createdAt).toLocaleDateString(APP_LOCALE, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-muted-foreground" />
            Assigned Users
            <Badge variant="secondary" className="ml-1 text-xs">
              {branch.users.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {branch.users.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No users assigned to this branch.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branch.users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      {u.userName ?? "—"}
                    </TableCell>
                    <TableCell>{u.userEmail ?? "—"}</TableCell>
                    <TableCell>
                      {u.isPrimary ? (
                        <Badge variant="default" className="text-xs">
                          Primary
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Member
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value || "—"}</span>
    </div>
  );
}
