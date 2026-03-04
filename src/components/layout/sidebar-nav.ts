import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  Briefcase,
  Calendar,
  Clock,
  CheckSquare,
  Bell,
  FileText,
  Timer,
  Receipt,
  CreditCard,
  Landmark,
  Wallet,
  ClipboardList,
  MessageSquare,
  BarChart3,
  Settings,
  User,
  Truck,
  Gavel,
  ShieldAlert,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import type { Resource } from "@/lib/auth/permissions";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  resource?: Resource;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const dashboardNav: NavGroup[] = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Management",
    items: [
      { label: "Attorneys", href: "/attorneys", icon: Users, resource: "attorneys" },
      { label: "Clients", href: "/clients", icon: UserCheck, resource: "clients" },
      { label: "Branches", href: "/settings/branches", icon: Building2, resource: "settings" },
    ],
  },
  {
    label: "Work",
    items: [
      { label: "Cases", href: "/cases", icon: Briefcase, resource: "cases" },
      { label: "Calendar", href: "/calendar", icon: Calendar, resource: "calendar" },
      { label: "Deadlines", href: "/deadlines", icon: Clock, resource: "calendar" },
      { label: "Tasks", href: "/tasks", icon: CheckSquare, resource: "calendar" },
      { label: "Bring-Ups", href: "/bring-ups", icon: Bell, resource: "calendar" },
      { label: "Documents", href: "/documents", icon: FileText, resource: "documents" },
      { label: "Courts", href: "/courts", icon: Gavel, resource: "cases" },
      { label: "Cause Lists", href: "/cause-lists", icon: ScrollText, resource: "cases" },
      { label: "Conflicts", href: "/conflicts", icon: ShieldAlert, resource: "cases" },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Time Tracking", href: "/time-expenses", icon: Timer, resource: "time-tracking" },
      { label: "Expenses", href: "/time-expenses?tab=expenses", icon: Receipt, resource: "expenses" },
      { label: "Billing", href: "/billing", icon: CreditCard, resource: "billing" },
      { label: "Trust Accounts", href: "/trust-accounts", icon: Landmark, resource: "trust-accounts" },
      { label: "Petty Cash", href: "/petty-cash", icon: Wallet, resource: "billing" },
      { label: "Requisitions", href: "/requisitions", icon: ClipboardList, resource: "billing" },
      { label: "Suppliers", href: "/suppliers", icon: Truck, resource: "settings" },
    ],
  },
  {
    label: "Communication",
    items: [
      { label: "Messages", href: "/messages", icon: MessageSquare, resource: "messages" },
      { label: "Notifications", href: "/notifications", icon: Bell },
    ],
  },
  {
    label: "Analytics",
    items: [
      { label: "Reports", href: "/reports", icon: BarChart3, resource: "reports" },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", href: "/settings", icon: Settings, resource: "settings" },
    ],
  },
];

export const portalNav: NavItem[] = [
  { label: "Dashboard", href: "/portal", icon: LayoutDashboard },
  { label: "My Cases", href: "/portal/cases", icon: Briefcase },
  { label: "My Documents", href: "/portal/documents", icon: FileText },
  { label: "My Invoices", href: "/portal/invoices", icon: CreditCard },
  { label: "Messages", href: "/portal/messages", icon: MessageSquare },
  { label: "My Profile", href: "/portal/profile", icon: User },
];
