import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Scale,
  Users,
  Calendar,
  BarChart3,
  Briefcase,
  Shield,
  Gavel,
  CircleDollarSign,
  FolderOpen,
  Clock,
  ArrowRight,
} from "lucide-react";
import { siteConfig } from "@/lib/config/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features",
  description: `Explore all the features of ${siteConfig.name} — case management, billing, compliance, and more.`,
};

const featureCategories = [
  {
    title: "Case Management",
    icon: Briefcase,
    features: [
      "Full case lifecycle tracking from intake to resolution",
      "Case pipeline with drag-and-drop Kanban board",
      "Matter categorization by practice area and court",
      "Case document linking and court filing tracking",
      "Conflict of interest checks",
    ],
  },
  {
    title: "Client Management",
    icon: Users,
    features: [
      "Complete client profiles with KYC compliance",
      "Client portal for case status and document access",
      "Client intake forms with customizable fields",
      "Communication history and message threading",
      "Client pipeline tracking",
    ],
  },
  {
    title: "Billing & Invoicing",
    icon: CircleDollarSign,
    features: [
      "Invoice generation with professional templates",
      "Time tracking and expense logging",
      "Trust account management (client funds)",
      "Petty cash and requisition tracking",
      "Quote generation and approval workflows",
    ],
  },
  {
    title: "Document Management",
    icon: FolderOpen,
    features: [
      "Cloud-based document storage with version control",
      "Document templates with variable substitution",
      "PDF generation for invoices and reports",
      "Document review workflows",
      "Secure file sharing with client portal",
    ],
  },
  {
    title: "Calendar & Deadlines",
    icon: Calendar,
    features: [
      "Shared firm calendar with court date tracking",
      "Deadline management with automated reminders",
      "Bring-up system for follow-up tasks",
      "iCal export for external calendar sync",
      "Court cause list integration",
    ],
  },
  {
    title: "Compliance & Regulatory",
    icon: Shield,
    features: [
      "Advocates Act compliance tracking",
      "AML/CFT regulation support",
      "Law Society of Kenya CPD tracking",
      "Disciplinary record management",
      "Audit log for all system actions",
    ],
  },
  {
    title: "Time & Expenses",
    icon: Clock,
    features: [
      "Timer-based and manual time entry",
      "Billable and non-billable hour tracking",
      "Weekly timesheet views",
      "Expense categorization and approval",
      "Attorney performance analytics",
    ],
  },
  {
    title: "Reporting & Analytics",
    icon: BarChart3,
    features: [
      "Revenue and billing dashboards",
      "Case status and pipeline reports",
      "Attorney utilization and performance",
      "Client and matter profitability",
      "Customizable report generation",
    ],
  },
  {
    title: "Courts & Cause Lists",
    icon: Gavel,
    features: [
      "Kenya court hierarchy database",
      "Court station management",
      "Cause list tracking and notifications",
      "Court rules and deadline calculation",
      "Filing deadline automation",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Scale className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold">{siteConfig.name}</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/pricing">Pricing</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        {/* Hero */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Everything Your Firm Needs
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            From case intake to final billing, {siteConfig.name} provides a
            complete suite of tools designed for modern law firms.
          </p>
        </div>

        {/* Feature Categories */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featureCategories.map((category) => (
            <Card key={category.title} className="flex flex-col">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <category.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{category.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2">
                  {category.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 rounded-2xl bg-primary/5 p-12 text-center">
          <h2 className="text-2xl font-bold">Ready to get started?</h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Start your free trial today. No credit card required.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Button size="lg" className="gap-2" asChild>
              <Link href="/signup">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
