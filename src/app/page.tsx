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
  Sparkles,
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
/*  DASHBOARD MOCKUP                                                    */
/* ------------------------------------------------------------------ */

function DashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-6xl">
      {/* Glow effects behind dashboard */}
      <div className="absolute -inset-8 rounded-3xl bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 opacity-70 blur-3xl" />

      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c1222] shadow-2xl shadow-blue-500/10">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-white/5 bg-[#080e1c] px-5 py-3">
          <div className="flex gap-2">
            <div className="h-3 w-3 rounded-full bg-red-400/80" />
            <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
            <div className="h-3 w-3 rounded-full bg-green-400/80" />
          </div>
          <div className="ml-4 flex h-7 flex-1 items-center rounded-lg bg-white/5 px-4">
            <span className="text-[11px] text-white/30">
              lawfirmregistry.co.ke/dashboard
            </span>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="hidden w-52 shrink-0 border-r border-white/5 bg-[#080e1c] p-4 md:block">
            <div className="mb-5 flex items-center gap-2.5 px-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
                <Scale className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-white/90">
                Law Firm
              </span>
            </div>
            <nav className="space-y-1">
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
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs ${
                    item.active
                      ? "bg-blue-500/15 text-blue-400 font-medium"
                      : "text-white/35 hover:text-white/60"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
              ))}
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 p-5">
            {/* Top bar */}
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white/90">
                  Dashboard
                </h3>
                <p className="text-[11px] text-white/30">
                  Welcome back, Jane Advocate
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                  <Search className="h-4 w-4 text-white/30" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                  <Bell className="h-4 w-4 text-white/30" />
                  <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-rose-500" />
                </div>
              </div>
            </div>

            {/* Stat cards */}
            <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
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
                  className={`rounded-xl bg-gradient-to-br ${s.color} border border-white/5 p-3`}
                >
                  <p className="text-[10px] font-medium text-white/40">
                    {s.label}
                  </p>
                  <div className="mt-1.5 flex items-end justify-between">
                    <span className="text-xl font-bold text-white/90">
                      {s.value}
                    </span>
                    <span
                      className={`flex items-center text-[10px] font-medium ${
                        s.up ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {s.up ? (
                        <ArrowUpRight className="mr-0.5 h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="mr-0.5 h-3 w-3" />
                      )}
                      {s.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-5 gap-3">
              {/* Revenue chart */}
              <div className="col-span-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-white/50">
                    Monthly Revenue
                  </span>
                  <span className="text-[10px] text-white/30">2024</span>
                </div>
                {/* Fake chart bars */}
                <div className="flex items-end gap-2" style={{ height: 72 }}>
                  {[40, 55, 35, 65, 50, 75, 60, 80, 70, 90, 85, 95].map(
                    (h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-gradient-to-t from-blue-500/60 to-blue-400/30"
                        style={{ height: `${h}%` }}
                      />
                    )
                  )}
                </div>
                <div className="mt-2 flex justify-between text-[9px] text-white/20">
                  <span>Jan</span>
                  <span>Mar</span>
                  <span>May</span>
                  <span>Jul</span>
                  <span>Sep</span>
                  <span>Nov</span>
                </div>
              </div>

              {/* Case types donut */}
              <div className="col-span-2 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <span className="text-[11px] font-medium text-white/50">
                  Case Types
                </span>
                <div className="mt-3 flex items-center justify-center">
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
                <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1">
                  {[
                    { label: "Civil", color: "bg-blue-500/50" },
                    { label: "Commercial", color: "bg-amber-500/50" },
                    { label: "Criminal", color: "bg-emerald-500/50" },
                    { label: "Family", color: "bg-purple-500/50" },
                  ].map((c) => (
                    <div key={c.label} className="flex items-center gap-1.5">
                      <div
                        className={`h-2 w-2 rounded-full ${c.color}`}
                      />
                      <span className="text-[9px] text-white/30">
                        {c.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent cases table */}
            <div className="mt-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-medium text-white/50">
                  Recent Cases
                </span>
                <span className="text-[10px] text-blue-400">View all</span>
              </div>
              <div className="space-y-1.5">
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
                    className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2"
                  >
                    <div>
                      <p className="text-[11px] font-medium text-white/70">
                        {c.name}
                      </p>
                      <p className="text-[9px] text-white/30">{c.type}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${c.statusColor}`}
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
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#070b14]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 sm:px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Law Firm Registry
            </span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm text-white/50 transition-colors hover:text-white"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-white/50 transition-colors hover:text-white"
            >
              How It Works
            </a>
            <a
              href="#compliance"
              className="text-sm text-white/50 transition-colors hover:text-white"
            >
              Compliance
            </a>
          </nav>
          <Button
            size="sm"
            className="gap-2 bg-white/10 text-white backdrop-blur hover:bg-white/20"
            asChild
          >
            <Link href="/login">
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          </Button>
        </div>
      </header>

      <main>
        {/* ============================================================ */}
        {/*  HERO                                                         */}
        {/* ============================================================ */}
        <section className="relative overflow-hidden bg-[#070b14]">
          {/* Gradient orbs - brighter and larger */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-40 -top-20 h-[800px] w-[800px] rounded-full bg-blue-600/[0.12] blur-[140px]" />
            <div className="absolute -right-40 top-10 h-[700px] w-[700px] rounded-full bg-indigo-500/[0.1] blur-[140px]" />
            <div className="absolute bottom-0 left-1/3 h-[500px] w-[900px] rounded-full bg-purple-500/[0.08] blur-[120px]" />
            <div className="absolute right-1/4 top-1/2 h-[400px] w-[400px] rounded-full bg-cyan-500/[0.06] blur-[100px]" />
          </div>

          {/* Subtle grid pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)`,
              backgroundSize: "80px 80px",
            }}
          />

          <div className="relative mx-auto max-w-[1400px] px-6 pb-20 pt-20 sm:px-8 md:pb-32 md:pt-28 lg:px-12">
            {/* Wide layout - not squeezed */}
            <div className="mx-auto max-w-5xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Badge className="mb-8 gap-2 border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300 shadow-lg shadow-blue-500/5 hover:bg-blue-500/10">
                  <Sparkles className="h-3.5 w-3.5" />
                  Built for Kenya&apos;s Legal Profession
                </Badge>
              </motion.div>

              <motion.h1
                className="mb-8 text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Your Practice,
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Fully Empowered
                </span>
              </motion.h1>

              <motion.p
                className="mx-auto mb-12 max-w-3xl text-lg leading-relaxed text-slate-300/70 md:text-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Manage cases, clients, billing, documents, and compliance from
                one powerful dashboard — purpose-built for Kenya law firms with
                full Advocates Act and AML/CFT regulation support.
              </motion.p>

              <motion.div
                className="flex flex-col items-center justify-center gap-4 sm:flex-row"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Button
                  size="lg"
                  className="h-13 gap-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 px-10 text-base font-semibold text-white shadow-xl shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:brightness-110"
                  asChild
                >
                  <Link href="/login">
                    Sign In to Dashboard
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-13 gap-2.5 border-white/10 bg-white/5 px-10 text-base font-semibold text-white transition-all hover:bg-white/10 hover:text-white"
                  asChild
                >
                  <Link href="/intake">
                    Submit Case Intake
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-slate-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <span className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10">
                    <Lock className="h-3 w-3 text-emerald-400" />
                  </div>
                  Bank-grade Security
                </span>
                <span className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  </div>
                  LSK Compliant
                </span>
                <span className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10">
                    <Wallet className="h-3 w-3 text-emerald-400" />
                  </div>
                  Trust Account Ready
                </span>
              </motion.div>
            </div>

            {/* Dashboard Preview */}
            <motion.div
              className="mt-20"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <DashboardMockup />
            </motion.div>
          </div>

          {/* Fade to light */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* ============================================================ */}
        {/*  STATS BAR                                                    */}
        {/* ============================================================ */}
        <section className="relative -mt-10 z-10">
          <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
            <motion.div
              className="grid grid-cols-2 gap-4 md:grid-cols-4"
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
                    className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 shadow-lg"
                  >
                    <div
                      className={`absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 blur-2xl`}
                    />
                    <div
                      className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient}`}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
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
        <section id="features" className="scroll-mt-20 py-28 lg:py-32">
          <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
            <div className="mx-auto mb-20 max-w-3xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Badge
                  variant="outline"
                  className="mb-5 border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary"
                >
                  <Zap className="mr-1.5 h-3.5 w-3.5" />
                  Features
                </Badge>
                <h2 className="mb-5 text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
                  Everything Your Firm Needs
                </h2>
                <p className="text-lg text-muted-foreground">
                  Six powerful modules designed specifically for Kenya law firm
                  operations, compliance, and growth.
                </p>
              </motion.div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                    <Card className="group relative h-full overflow-hidden border-border/50 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                      {/* Colored top accent bar */}
                      <div
                        className={`h-1 w-full bg-gradient-to-r ${feature.gradient}`}
                      />
                      <CardContent className="p-8">
                        <div
                          className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg`}
                        >
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="mb-3 text-xl font-semibold text-foreground">
                          {feature.title}
                        </h3>
                        <p className="text-[15px] leading-relaxed text-muted-foreground">
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
          className="scroll-mt-20 border-y border-border/40 bg-muted/30 py-28 lg:py-32"
        >
          <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
            <div className="mx-auto mb-20 max-w-3xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Badge
                  variant="outline"
                  className="mb-5 border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary"
                >
                  How It Works
                </Badge>
                <h2 className="mb-5 text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
                  Get Started in Three Steps
                </h2>
                <p className="text-lg text-muted-foreground">
                  From onboarding to insights — streamline your firm&apos;s
                  operations quickly.
                </p>
              </motion.div>
            </div>

            <div className="relative grid gap-8 md:grid-cols-3 md:gap-10">
              {/* Connecting line */}
              <div className="absolute left-0 right-0 top-24 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />

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
                    <div className="relative rounded-2xl border border-border/50 bg-card p-10 shadow-sm">
                      {/* Number circle */}
                      <div
                        className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-lg`}
                      >
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <span
                        className={`absolute right-8 top-8 text-6xl font-black bg-gradient-to-br ${step.color} bg-clip-text text-transparent opacity-10`}
                      >
                        {step.number}
                      </span>
                      <h3 className="mb-3 text-xl font-semibold text-foreground">
                        {step.title}
                      </h3>
                      <p className="text-[15px] leading-relaxed text-muted-foreground">
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
        <section id="compliance" className="scroll-mt-20 py-28 lg:py-32">
          <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-20">
              {/* Left — Text */}
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Badge
                  variant="outline"
                  className="mb-5 gap-1.5 border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-sm text-emerald-600 dark:text-emerald-400"
                >
                  <Shield className="h-3.5 w-3.5" />
                  Compliance First
                </Badge>
                <h2 className="mb-5 text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
                  Built for Kenya&apos;s
                  <br />
                  Regulatory Landscape
                </h2>
                <p className="mb-10 text-lg text-muted-foreground">
                  Every feature is designed with compliance at its core — so your
                  firm stays ahead of regulatory requirements without the
                  overhead.
                </p>

                <div className="space-y-6">
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
                      <div key={item.title} className="flex gap-5">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} shadow-lg`}
                        >
                          <ItemIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-foreground">
                            {item.title}
                          </p>
                          <p className="text-[15px] text-muted-foreground">
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
                className="grid grid-cols-2 gap-5"
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
                      className={`relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 shadow-sm ${
                        i % 2 === 1 ? "mt-8" : ""
                      }`}
                    >
                      <div
                        className={`absolute -right-4 -top-4 h-28 w-28 rounded-full bg-gradient-to-br ${card.gradient} opacity-10 blur-2xl`}
                      />
                      <div
                        className={`mb-4 inline-flex h-13 w-13 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient}`}
                      >
                        <CIcon className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-4xl font-bold text-foreground">
                        {card.value}
                      </p>
                      <p className="mt-1.5 text-sm text-muted-foreground">
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
        {/*  CTA                                                          */}
        {/* ============================================================ */}
        <section className="relative overflow-hidden bg-[#070b14] py-28 lg:py-32">
          {/* Gradient orbs */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-blue-600/15 blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 h-[450px] w-[450px] rounded-full bg-purple-600/15 blur-[120px]" />
          </div>

          <div className="relative mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
            <motion.div
              className="mx-auto max-w-3xl text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="mb-6 text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
                Ready to Streamline
                <br />
                Your Practice?
              </h2>
              <p className="mb-10 text-lg text-slate-300/70">
                Access your dashboard to manage cases, clients, billing, and
                compliance — all from one place.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="h-13 gap-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 px-10 text-base font-semibold text-white shadow-xl shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:brightness-110"
                  asChild
                >
                  <Link href="/login">
                    Sign In to Dashboard
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-13 gap-2.5 border-white/10 bg-white/5 px-10 text-base font-semibold text-white transition-all hover:bg-white/10 hover:text-white"
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
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="py-16">
            <div className="grid gap-10 md:grid-cols-4">
              {/* Brand */}
              <div className="md:col-span-2">
                <Link href="/" className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm">
                    <Scale className="h-4.5 w-4.5 text-primary-foreground" />
                  </div>
                  <span className="text-base font-bold tracking-tight">
                    Law Firm Registry
                  </span>
                </Link>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                  A comprehensive practice management system built for Kenya law
                  firms. Manage cases, clients, billing, and regulatory
                  compliance from one secure platform.
                </p>
              </div>

              {/* Links */}
              <div>
                <h4 className="mb-4 text-sm font-semibold text-foreground">
                  Quick Links
                </h4>
                <ul className="space-y-3 text-sm">
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
                <h4 className="mb-4 text-sm font-semibold text-foreground">
                  Contact
                </h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2.5 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    info@lawfirmregistry.co.ke
                  </li>
                  <li className="flex items-center gap-2.5 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    +254 700 000 000
                  </li>
                  <li className="flex items-center gap-2.5 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    Nairobi, Kenya
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <Separator className="opacity-50" />

          <div className="flex flex-col items-center justify-between gap-4 py-8 md:flex-row">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Law Firm Registry. All rights
              reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
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
