import { requireAdmin } from "@/lib/auth/get-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Users, Briefcase, Building2, Shield, Database } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "System configuration and administration",
};

const settingsGroups = [
  {
    title: "User Management",
    description: "Manage user accounts, roles, and permissions",
    href: "/settings/users",
    icon: Users,
  },
  {
    title: "Practice Areas & Rates",
    description: "Configure practice areas and billing rates",
    href: "/settings/practice-areas",
    icon: Briefcase,
  },
  {
    title: "Firm Settings",
    description: "Firm name, branding, and general configuration",
    href: "/settings/firm",
    icon: Building2,
  },
  {
    title: "Branch Management",
    description: "Manage multi-branch offices",
    href: "/settings/branches",
    icon: Building2,
  },
  {
    title: "Audit Log",
    description: "View system activity and audit trail",
    href: "/settings/audit-log",
    icon: Shield,
  },
  {
    title: "Data Management",
    description: "Import, export, and backup data",
    href: "/settings/data",
    icon: Database,
  },
];

export default async function SettingsPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">System configuration and administration.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsGroups.map((group) => (
          <Link key={group.href} href={group.href}>
            <Card className="hover:bg-muted/50 transition-colors h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <group.icon className="h-5 w-5" />
                  {group.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{group.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
