import { requireAdmin } from "@/lib/auth/get-session";
import Link from "next/link";
import { Users, Briefcase, Building2, Shield, Database, Settings, Paintbrush, Calendar, Gavel } from "lucide-react";
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
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Role Permissions",
    description: "Control what each role can access and do",
    href: "/settings/permissions",
    icon: Shield,
    color: "bg-indigo-500/10 text-indigo-600",
  },
  {
    title: "Practice Areas & Rates",
    description: "Configure practice areas and billing rates",
    href: "/settings/practice-areas",
    icon: Briefcase,
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    title: "Firm Settings",
    description: "Firm name, branding, and general configuration",
    href: "/settings/firm",
    icon: Building2,
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    title: "Branch Management",
    description: "Manage multi-branch offices",
    href: "/settings/branches",
    icon: Building2,
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: "Branding",
    description: "Logo, colors, and firm identity",
    href: "/settings/branding",
    icon: Paintbrush,
    color: "bg-pink-500/10 text-pink-600",
  },
  {
    title: "Audit Log",
    description: "View system activity and audit trail",
    href: "/settings/audit-log",
    icon: Shield,
    color: "bg-rose-500/10 text-rose-600",
  },
  {
    title: "Data Management",
    description: "Import, export, and backup data",
    href: "/settings/data",
    icon: Database,
    color: "bg-cyan-500/10 text-cyan-600",
  },
  {
    title: "Calendar Sync",
    description: "Subscribe to your calendar via iCal feed",
    href: "/settings/calendar-sync",
    icon: Calendar,
    color: "bg-teal-500/10 text-teal-600",
  },
  {
    title: "Court Rules",
    description: "Manage court deadline rules and automations",
    href: "/settings/court-rules",
    icon: Gavel,
    color: "bg-orange-500/10 text-orange-600",
  },
];

export default async function SettingsPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            System configuration and administration.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsGroups.map((group) => {
          const Icon = group.icon;
          return (
            <Link key={group.href} href={group.href}>
              <div className="group h-full rounded-xl border bg-card p-5 shadow-sm transition-all hover:border-primary/20 hover:shadow-md">
                <div
                  className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg ${group.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  {group.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {group.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
