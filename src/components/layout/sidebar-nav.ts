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
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  adminOnly?: boolean;
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
      { label: "Attorneys", href: "/attorneys", icon: Users },
      { label: "Clients", href: "/clients", icon: UserCheck },
      { label: "Branches", href: "/settings/branches", icon: Building2, adminOnly: true },
    ],
  },
  {
    label: "Work",
    items: [
      { label: "Cases", href: "/cases", icon: Briefcase },
      { label: "Calendar", href: "/calendar", icon: Calendar },
      { label: "Deadlines", href: "/deadlines", icon: Clock },
      { label: "Tasks", href: "/tasks", icon: CheckSquare },
      { label: "Bring-Ups", href: "/bring-ups", icon: Bell },
      { label: "Documents", href: "/documents", icon: FileText },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Time Tracking", href: "/time-expenses", icon: Timer },
      { label: "Expenses", href: "/time-expenses?tab=expenses", icon: Receipt },
      { label: "Billing", href: "/billing", icon: CreditCard },
      { label: "Trust Accounts", href: "/trust-accounts", icon: Landmark },
      { label: "Petty Cash", href: "/petty-cash", icon: Wallet },
      { label: "Requisitions", href: "/requisitions", icon: ClipboardList },
      { label: "Suppliers", href: "/suppliers", icon: Truck, adminOnly: true },
    ],
  },
  {
    label: "Communication",
    items: [
      { label: "Messages", href: "/messages", icon: MessageSquare },
      { label: "Notifications", href: "/notifications", icon: Bell },
    ],
  },
  {
    label: "Analytics",
    items: [
      { label: "Reports", href: "/reports", icon: BarChart3 },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", href: "/settings", icon: Settings },
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
