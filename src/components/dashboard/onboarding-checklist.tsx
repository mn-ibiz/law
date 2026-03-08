"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, X, Users, Palette, Briefcase, DollarSign, UserPlus, Scale } from "lucide-react";
import Link from "next/link";

interface ChecklistItem {
  key: string;
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  completed: boolean;
}

interface OnboardingChecklistProps {
  items: ChecklistItem[];
  firmName: string;
  daysOld: number;
}

export function OnboardingChecklist({ items, firmName, daysOld }: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(true);

  if (dismissed) return null;

  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;
  const allDone = completedCount === totalCount;

  if (allDone) return null;

  const pct = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Scale className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Welcome to {firmName}!</h3>
            <p className="text-xs text-muted-foreground">
              {completedCount}/{totalCount} steps completed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 rounded-full bg-muted">
            <div
              className="h-1.5 rounded-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded p-1 hover:bg-muted"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="rounded p-1 hover:bg-muted"
            title="Dismiss checklist"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t px-4 pb-4 pt-2">
          <div className="space-y-2">
            {items.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg p-2.5 text-sm transition-colors ${
                  item.completed
                    ? "bg-muted/50 text-muted-foreground"
                    : "hover:bg-muted/50"
                }`}
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    item.completed
                      ? "bg-primary text-primary-foreground"
                      : "border-2 border-muted-foreground/30"
                  }`}
                >
                  {item.completed && <Check className="h-3 w-3" />}
                </div>
                <div className="flex items-center gap-2">
                  {item.icon}
                  <div>
                    <span className={item.completed ? "line-through" : "font-medium"}>
                      {item.label}
                    </span>
                    {!item.completed && (
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Build checklist items from org data.
 * This derives completion from actual data presence rather than tracking state separately.
 */
export function buildChecklistItems(data: {
  hasAttorneys: boolean;
  hasBranding: boolean;
  hasClients: boolean;
  hasBillingRates: boolean;
  hasTeamMembers: boolean;
}): ChecklistItem[] {
  return [
    {
      key: "attorneys",
      label: "Add your first attorney",
      description: "Register attorneys who will handle cases",
      href: "/attorneys",
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      completed: data.hasAttorneys,
    },
    {
      key: "branding",
      label: "Configure firm branding",
      description: "Upload your logo and set firm colors",
      href: "/settings/branding",
      icon: <Palette className="h-4 w-4 text-muted-foreground" />,
      completed: data.hasBranding,
    },
    {
      key: "clients",
      label: "Add your first client",
      description: "Import or create a client record",
      href: "/clients",
      icon: <Briefcase className="h-4 w-4 text-muted-foreground" />,
      completed: data.hasClients,
    },
    {
      key: "billing",
      label: "Set up billing rates",
      description: "Configure hourly rates for your attorneys",
      href: "/settings/firm",
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
      completed: data.hasBillingRates,
    },
    {
      key: "team",
      label: "Invite a team member",
      description: "Add colleagues to your firm",
      href: "/settings/users",
      icon: <UserPlus className="h-4 w-4 text-muted-foreground" />,
      completed: data.hasTeamMembers,
    },
  ];
}
