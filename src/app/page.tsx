"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Scale,
  Shield,
  Users,
  FileText,
  Calendar,
  BarChart3,
  Briefcase,
  ArrowRight,
  Gavel,
  Lock,
  CheckCircle2,
  LogIn,
  ClipboardCheck,
  FolderOpen,
  TrendingUp,
  Clock,
  Building2,
  Phone,
  Mail,
  CircleDollarSign,
  Activity,
  Bell,
  Search,
  ChevronRight,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const features = [
  {
    icon: Users,
    title: "Client & Attorney Management",
    description:
      "Manage attorneys, clients, KYC compliance, and conflict-of-interest checks with full audit trails.",
    gradient: "from-blue-500 to-blue-600",
    bg: "bg-blue-500/10",
    accent: "text-blue-500",
  },
  {
    icon: Briefcase,
    title: "Case Management",
    description:
      "Track cases through the full lifecycle with Kenya court hierarchy, Kanban pipeline, and deadline automation.",
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-500/10",
    accent: "text-amber-500",
  },
  {
    icon: Shield,
    title: "Compliance & Security",
    description:
      "AML/CFT compliance, KRA tax integration, Data Protection Act adherence, and role-based access control.",
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-500/10",
    accent: "text-emerald-500",
  },
  {
    icon: Calendar,
    title: "Calendar & Deadlines",
    description:
      "Court calendar integration, automated deadline tracking, file bring-up reminders, and task management.",
    gradient: "from-purple-500 to-violet-500",
    bg: "bg-purple-500/10",
    accent: "text-purple-500",
  },
  {
    icon: BarChart3,
    title: "Billing & Finance",
    description:
      "Fee notes, M-Pesa payment tracking, trust accounts, petty cash, and full KES + VAT 16% support.",
    gradient: "from-rose-500 to-pink-500",
    bg: "bg-rose-500/10",
    accent: "text-rose-500",
  },
  {
    icon: FileText,
    title: "Document Management",
    description:
      "Upload, version, template, and manage legal documents securely with role-based access controls.",
    gradient: "from-cyan-500 to-sky-500",
    bg: "bg-cyan-500/10",
    accent: "text-cyan-500",
  },
];

const steps = [
  {
    number: "01",
    icon: ClipboardCheck,
    title: "Onboard Your Team",
    description:
      "Add attorneys, staff, and practice areas. Configure roles and permissions to match your firm structure.",
    color: "from-blue-500 to-indigo-500",
  },
  {
    number: "02",
    icon: FolderOpen,
    title: "Manage Cases & Clients",
    description:
      "Register clients with KYC, open matters, track deadlines, and manage the entire case lifecycle.",
    color: "from-amber-500 to-orange-500",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Bill, Report & Grow",
    description:
      "Generate fee notes, track payments via M-Pesa, manage trust accounts, and gain insights from analytics.",
    color: "from-emerald-500 to-teal-500",
  },
];

/* ------------------------------------------------------------------ */
/*  DASHBOARD MOCKUP COMPONENTS                                        */
/* ------------------------------------------------------------------ */

function DashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-5xl">
      {/* Glow effects behind dashboard */}
      <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-blue-500/20 via-primary/20 to-purple-500/20 opacity-60 blur-2xl" />

      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0f1729] shadow-2xl shadow-primary/10">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-white/5 bg-[#0a0f1e] px-4 py-2.5">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400/80" />
            <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
            <div className="h-3 w-3 rounded-full bg-green-400/80" />
          </div>
          <div className="ml-4 flex h-6 flex-1 items-center rounded-md bg-white/5 px-3">
            <span className="text-[10px] text-white/30">
              lawfirmregistry.co.ke/dashboard
            </span>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="hidden w-48 shrink-0 border-r border-white/5 bg-[#0a0f1e] p-3 md:block">
            <div className="mb-4 flex items-center gap-2 px-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500">
                <Scale className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs font-semibold text-white/90">
                Law Firm
              </span>
            </div>
            <nav className="space-y-0.5">
              {[
                { label: "Dashboard", icon: Activity, active: true },
                { label: "Cases", icon: Briefcase, active: false },
                { label: "Clients", icon: Users, active: false },
                { label: "Billing", icon: CircleDollarSign, active: false },
                { label: "Calendar", icon: Calendar, active: false },
                { label: "Documents", icon: FileText, active: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] ${
                    item.active
                      ? "bg-blue-500/20 text-blue-400"
                      : "text-white/40 hover:text-white/60"
                  }`}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </div>
              ))}
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 p-4">
            {/* Top bar */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white/90">
                  Dashboard
                </h3>
                <p className="text-[10px] text-white/30">
                  Welcome back, Jane Advocate
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/5">
                  <Search className="h-3.5 w-3.5 text-white/30" />
                </div>
                <div className="relative flex h-7 w-7 items-center justify-center rounded-md bg-white/5">
                  <Bell className="h-3.5 w-3.5 text-white/30" />
                  <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-rose-500" />
                </div>
              </div>
            </div>

            {/* Stat cards */}
            <div className="mb-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
              {[
                {
                  label: "Active Cases",
                  value: "47",
                  change: "+3",
                  up: true,
                  color: "from-blue-500/20 to-blue-600/10",
                  iconColor: "text-blue-400",
                },
                {
                  label: "Revenue (KES)",
                  value: "2.4M",
                  change: "+12%",
                  up: true,
                  color: "from-emerald-500/20 to-emerald-600/10",
                  iconColor: "text-emerald-400",
                },
                {
                  label: "Pending Invoices",
                  value: "12",
                  change: "-2",
                  up: false,
                  color: "from-amber-500/20 to-amber-600/10",
                  iconColor: "text-amber-400",
                },
                {
                  label: "Trust Balance",
                  value: "8.1M",
                  change: "+5%",
                  up: true,
                  color: "from-purple-500/20 to-purple-600/10",
                  iconColor: "text-purple-400",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`rounded-lg bg-gradient-to-br ${s.color} border border-white/5 p-2.5`}
                >
                  <p className="text-[9px] font-medium text-white/40">
                    {s.label}
                  </p>
                  <div className="mt-1 flex items-end justify-between">
                    <span className="text-lg font-bold text-white/90">
                      {s.value}
                    </span>
                    <span
                      className={`flex items-center text-[9px] font-medium ${
                        s.up ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {s.up ? (
                        <ArrowUpRight className="mr-0.5 h-2.5 w-2.5" />
                      ) : (
                        <ArrowDownRight className="mr-0.5 h-2.5 w-2.5" />
                      )}
                      {s.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-5 gap-2">
              {/* Revenue chart */}
              <div className="col-span-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] font-medium text-white/50">
                    Monthly Revenue
                  </span>
                  <span className="text-[9px] text-white/30">2024</span>
                </div>
                {/* Fake chart bars */}
                <div className="flex items-end gap-1.5" style={{ height: 64 }}>
                  {[40, 55, 35, 65, 50, 75, 60, 80, 70, 90, 85, 95].map(
                    (h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-sm bg-gradient-to-t from-blue-500/60 to-blue-400/30"
                        style={{ height: `${h}%` }}
                      />
                    )
                  )}
                </div>
                <div className="mt-1.5 flex justify-between text-[8px] text-white/20">
                  <span>Jan</span>
                  <span>Mar</span>
                  <span>May</span>
                  <span>Jul</span>
                  <span>Sep</span>
                  <span>Nov</span>
                </div>
              </div>

              {/* Case types donut */}
              <div className="col-span-2 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <span className="text-[10px] font-medium text-white/50">
                  Case Types
                </span>
                <div className="mt-2 flex items-center justify-center">
                  <svg viewBox="0 0 80 80" className="h-16 w-16">
                    <circle
                      cx="40"
                      cy="40"
                      r="30"
                      fill="none"
                      stroke="rgba(59,130,246,0.5)"
                      strokeWidth="8"
                      strokeDasharray="65 188.5"
                      strokeDashoffset="0"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="30"
                      fill="none"
                      stroke="rgba(245,158,11,0.5)"
                      strokeWidth="8"
                      strokeDasharray="47 188.5"
                      strokeDashoffset="-65"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="30"
                      fill="none"
                      stroke="rgba(16,185,129,0.5)"
                      strokeWidth="8"
                      strokeDasharray="38 188.5"
                      strokeDashoffset="-112"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="30"
                      fill="none"
                      stroke="rgba(168,85,247,0.5)"
                      strokeWidth="8"
                      strokeDasharray="38.5 188.5"
                      strokeDashoffset="-150"
                    />
                  </svg>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-0.5">
                  {[
                    { label: "Civil", color: "bg-blue-500/50" },
                    { label: "Commercial", color: "bg-amber-500/50" },
                    { label: "Criminal", color: "bg-emerald-500/50" },
                    { label: "Family", color: "bg-purple-500/50" },
                  ].map((c) => (
                    <div key={c.label} className="flex items-center gap-1">
                      <div className={`h-1.5 w-1.5 rounded-full ${c.color}`} />
                      <span className="text-[8px] text-white/30">
                        {c.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent cases table */}
            <div className="mt-2 rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-medium text-white/50">
                  Recent Cases
                </span>
                <span className="text-[9px] text-blue-400">View all</span>
              </div>
              <div className="space-y-1">
                {[
                  {
                    name: "Wanjiku vs KRA",
                    type: "Tax Dispute",
                    status: "Active",
                    statusColor: "bg-emerald-400/20 text-emerald-400",
                  },
                  {
                    name: "Kamau Land Title",
                    type: "Conveyancing",
                    status: "In Review",
                    statusColor: "bg-amber-400/20 text-amber-400",
                  },
                  {
                    name: "Otieno Employment",
                    type: "Labour",
                    status: "Active",
                    statusColor: "bg-emerald-400/20 text-emerald-400",
                  },
                ].map((c) => (
                  <div
                    key={c.name}
                    className="flex items-center justify-between rounded-md bg-white/[0.02] px-2 py-1.5"
                  >
                    <div>
                      <p className="text-[10px] font-medium text-white/70">
                        {c.name}
                      </p>
                      <p className="text-[8px] text-white/30">{c.type}</p>
                    </div>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[8px] font-medium ${c.statusColor}`}
                    >
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN PAGE                                                          */
/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-sm">
              <Scale className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Law Firm Registry
            </span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <a
              href="#features"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              How It Works
            </a>
            <a
              href="#compliance"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Compliance
            </a>
          </nav>
          <Button size="sm" asChild>
            <Link href="/login" className="gap-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          </Button>
        </div>
      </header>

      <main>
        {/* ============================================================ */}
        {/*  HERO — Dark immersive section with dashboard preview         */}
        {/* ============================================================ */}
        <section className="relative overflow-hidden bg-[#070b14]">
          {/* Gradient orbs */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-32 top-0 h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
            <div className="absolute -right-32 top-20 h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[120px]" />
            <div className="absolute bottom-0 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />
          </div>
          {/* Grid pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />

          <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 md:pb-24 md:pt-24 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Badge className="mb-6 gap-1.5 border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300 hover:bg-blue-500/10">
                  <Gavel className="h-3 w-3" />
                  Built for Kenya&apos;s Legal Profession
                </Badge>
              </motion.div>

              <motion.h1
                className="mb-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-white md:text-6xl lg:text-7xl"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Your Practice,
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-primary to-purple-400 bg-clip-text text-transparent">
                  Fully Empowered
                </span>
              </motion.h1>

              <motion.p
                className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-slate-400 md:text-lg"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Manage cases, clients, billing, documents, and compliance from
                one powerful dashboard — purpose-built for Kenya law firms with
                full Advocates Act and AML/CFT regulation support.
              </motion.p>

              <motion.div
                className="flex flex-col items-center justify-center gap-3 sm:flex-row"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Button
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-blue-600 to-primary px-8 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                  asChild
                >
                  <Link href="/login">
                    Sign In to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                  asChild
                >
                  <Link href="/intake">
                    Submit Case Intake
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>

              {/* Trust row */}
              <motion.div
                className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-emerald-400" />
                  Bank-grade Security
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  LSK Compliant
                </span>
                <span className="flex items-center gap-1.5">
                  <Wallet className="h-3.5 w-3.5 text-emerald-400" />
                  Trust Account Ready
                </span>
              </motion.div>
            </div>

            {/* Dashboard Preview */}
            <motion.div
              className="mt-16"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <DashboardMockup />
            </motion.div>
          </div>

          {/* Fade to light */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* ============================================================ */}
        {/*  STATS BAR                                                    */}
        {/* ============================================================ */}
        <section className="relative -mt-8 z-10">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="grid grid-cols-2 gap-3 md:grid-cols-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {[
                {
                  value: "6",
                  label: "Core Modules",
                  icon: Layers,
                  gradient: "from-blue-500 to-blue-600",
                },
                {
                  value: "100%",
                  label: "LSK Compliant",
                  icon: CheckCircle2,
                  gradient: "from-emerald-500 to-teal-500",
                },
                {
                  value: "24/7",
                  label: "Availability",
                  icon: Clock,
                  gradient: "from-amber-500 to-orange-500",
                },
                {
                  value: "256-bit",
                  label: "Encryption",
                  icon: Lock,
                  gradient: "from-purple-500 to-violet-500",
                },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-5 shadow-lg"
                  >
                    <div
                      className={`absolute -right-3 -top-3 h-16 w-16 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 blur-xl`}
                    />
                    <div
                      className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${stat.gradient}`}
                    >
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  FEATURES                                                     */}
        {/* ============================================================ */}
        <section id="features" className="scroll-mt-20 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Badge
                  variant="outline"
                  className="mb-4 border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary"
                >
                  <Zap className="mr-1 h-3 w-3" />
                  Features
                </Badge>
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  Everything Your Firm Needs
                </h2>
                <p className="text-muted-foreground">
                  Six powerful modules designed specifically for Kenya law firm
                  operations, compliance, and growth.
                </p>
              </motion.div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                  >
                    <Card className="group relative h-full overflow-hidden border-border/50 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                      {/* Colored top accent bar */}
                      <div
                        className={`h-1 w-full bg-gradient-to-r ${feature.gradient}`}
                      />
                      <CardContent className="p-6">
                        <div
                          className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-sm`}
                        >
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-foreground">
                          {feature.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  HOW IT WORKS                                                 */}
        {/* ============================================================ */}
        <section
          id="how-it-works"
          className="scroll-mt-20 border-y border-border/40 bg-muted/30 py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Badge
                  variant="outline"
                  className="mb-4 border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary"
                >
                  How It Works
                </Badge>
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  Get Started in Three Steps
                </h2>
                <p className="text-muted-foreground">
                  From onboarding to insights — streamline your firm&apos;s
                  operations quickly.
                </p>
              </motion.div>
            </div>

            <div className="relative grid gap-8 md:grid-cols-3">
              {/* Connecting line */}
              <div className="absolute left-0 right-0 top-20 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />

              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.title}
                    className="relative"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.15 }}
                  >
                    <div className="relative rounded-2xl border border-border/50 bg-card p-8 shadow-sm">
                      {/* Number circle */}
                      <div
                        className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-lg`}
                      >
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <span
                        className={`absolute right-6 top-6 text-5xl font-black bg-gradient-to-br ${step.color} bg-clip-text text-transparent opacity-15`}
                      >
                        {step.number}
                      </span>
                      <h3 className="mb-2 text-xl font-semibold text-foreground">
                        {step.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  COMPLIANCE SECTION                                           */}
        {/* ============================================================ */}
        <section id="compliance" className="scroll-mt-20 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
              {/* Left — Text */}
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Badge
                  variant="outline"
                  className="mb-4 gap-1.5 border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs text-emerald-600 dark:text-emerald-400"
                >
                  <Shield className="h-3 w-3" />
                  Compliance First
                </Badge>
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  Built for Kenya&apos;s
                  <br />
                  Regulatory Landscape
                </h2>
                <p className="mb-8 text-muted-foreground">
                  Every feature is designed with compliance at its core — so your
                  firm stays ahead of regulatory requirements without the
                  overhead.
                </p>

                <div className="space-y-5">
                  {[
                    {
                      title: "Advocates Act Compliance",
                      desc: "Trust account management, fee structures, and professional standards built in.",
                      icon: Scale,
                      color: "from-blue-500 to-blue-600",
                    },
                    {
                      title: "AML/CFT Regulations",
                      desc: "Automated KYC checks, risk profiling, and suspicious transaction reporting.",
                      icon: Shield,
                      color: "from-emerald-500 to-teal-500",
                    },
                    {
                      title: "Data Protection Act",
                      desc: "Role-based access, audit trails, and data handling aligned with Kenya DPA.",
                      icon: Lock,
                      color: "from-purple-500 to-violet-500",
                    },
                    {
                      title: "KRA Tax Integration",
                      desc: "VAT 16% calculation, withholding tax support, and KRA-ready reporting.",
                      icon: CircleDollarSign,
                      color: "from-amber-500 to-orange-500",
                    },
                  ].map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <div key={item.title} className="flex gap-4">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${item.color}`}
                        >
                          <ItemIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {item.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Right — Visual Cards */}
              <motion.div
                className="grid grid-cols-2 gap-4"
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                {[
                  {
                    icon: Shield,
                    label: "Role-Based Access",
                    value: "5 Roles",
                    gradient: "from-blue-500 to-blue-600",
                  },
                  {
                    icon: FileText,
                    label: "Audit Trails",
                    value: "Full History",
                    gradient: "from-amber-500 to-orange-500",
                  },
                  {
                    icon: Lock,
                    label: "Data Encryption",
                    value: "AES-256",
                    gradient: "from-emerald-500 to-teal-500",
                  },
                  {
                    icon: Activity,
                    label: "Uptime SLA",
                    value: "99.9%",
                    gradient: "from-purple-500 to-violet-500",
                  },
                ].map((card, i) => {
                  const CIcon = card.icon;
                  return (
                    <div
                      key={card.label}
                      className={`relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 shadow-sm ${
                        i % 2 === 1 ? "mt-6" : ""
                      }`}
                    >
                      <div
                        className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br ${card.gradient} opacity-10 blur-2xl`}
                      />
                      <div
                        className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient}`}
                      >
                        <CIcon className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-3xl font-bold text-foreground">
                        {card.value}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {card.label}
                      </p>
                    </div>
                  );
                })}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  CTA — Dark gradient section                                  */}
        {/* ============================================================ */}
        <section className="relative overflow-hidden bg-[#070b14] py-24">
          {/* Gradient orbs */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/4 top-0 h-[400px] w-[400px] rounded-full bg-blue-600/15 blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 h-[350px] w-[350px] rounded-full bg-purple-600/15 blur-[100px]" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="mx-auto max-w-2xl text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
                Ready to Streamline
                <br />
                Your Practice?
              </h2>
              <p className="mb-8 text-slate-400">
                Access your dashboard to manage cases, clients, billing, and
                compliance — all from one place.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-blue-600 to-primary px-8 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                  asChild
                >
                  <Link href="/login">
                    Sign In to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                  asChild
                >
                  <Link href="/intake">Submit a Case Intake</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ============================================================ */}
      {/*  FOOTER                                                       */}
      {/* ============================================================ */}
      <footer className="border-t border-border/40 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-12">
            <div className="grid gap-8 md:grid-cols-4">
              {/* Brand */}
              <div className="md:col-span-2">
                <Link href="/" className="mb-4 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
                    <Scale className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="text-base font-bold tracking-tight">
                    Law Firm Registry
                  </span>
                </Link>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  A comprehensive practice management system built for Kenya law
                  firms. Manage cases, clients, billing, and regulatory
                  compliance from one secure platform.
                </p>
              </div>

              {/* Links */}
              <div>
                <h4 className="mb-3 text-sm font-semibold text-foreground">
                  Quick Links
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      href="/login"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/intake"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Case Intake
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="mb-3 text-sm font-semibold text-foreground">
                  Contact
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    info@lawfirmregistry.co.ke
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    +254 700 000 000
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" />
                    Nairobi, Kenya
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <Separator className="opacity-50" />

          <div className="flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Law Firm Registry. All rights
              reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Link
                href="#"
                className="transition-colors hover:text-foreground"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="transition-colors hover:text-foreground"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
