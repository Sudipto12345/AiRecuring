import {
  Activity,
  BadgeCheck,
  BarChart3,
  Bell,
  Bot,
  Boxes,
  Brain,
  Briefcase,
  Building2,
  CalendarClock,
  Clock,
  Cloud,
  Coins,
  CreditCard,
  Database,
  FileText,
  FileSpreadsheet,
  Flag,
  FolderArchive,
  Gauge,
  Globe,
  HardDrive,
  Inbox,
  Key,
  KeyRound,
  LayoutDashboard,
  Layers,
  Lock,
  Mail,
  MessageSquare,
  Network,
  Plug,
  Receipt,
  RefreshCw,
  Send,
  Server,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Ticket,
  Users,
  UserCheck,
  UserCog,
  Video,
  Wallet,
  Workflow,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  real?: boolean; // still on sample data
}

export interface AdminNavGroup {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  items: AdminNavItem[];
}

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    id: "platform",
    label: "Platform",
    icon: Building2,
    items: [
      { label: "Companies", href: "/admin/companies", icon: Building2, real: true },
      { label: "Company Verification", href: "/admin/companies/verification", icon: BadgeCheck, real: true },
    ],
  },
  {
    id: "users",
    label: "Users",
    icon: Users,
    items: [
      { label: "Platform Users", href: "/admin/users", icon: Users, real: true },
      { label: "Super Admins", href: "/admin/users/super-admins", icon: ShieldCheck, real: true },
      { label: "Support Staff", href: "/admin/users/support", icon: UserCog, real: true },
      { label: "Login Sessions", href: "/admin/users/sessions", icon: KeyRound, real: true },
      { label: "User Activity", href: "/admin/users/activity", icon: Activity, real: true },
    ],
  },
  {
    id: "subscription",
    label: "Subscription & Billing",
    icon: CreditCard,
    items: [
      { label: "Plans", href: "/admin/subscription/plans", icon: Layers, real: true },
      { label: "Active Subscriptions", href: "/admin/subscription/active", icon: BadgeCheck, real: true },
      { label: "Invoices", href: "/admin/subscription/invoices", icon: Receipt, real: true },
      { label: "Coupons", href: "/admin/subscription/coupons", icon: Ticket, real: true },
      { label: "Renewals", href: "/admin/subscription/renewals", icon: RefreshCw, real: true },
      { label: "Transactions", href: "/admin/subscription/transactions", icon: CreditCard, real: true },
    ],
  },
  {
    id: "ai",
    label: "AI Platform",
    icon: Bot,
    items: [
      { label: "AI Providers & Bedrock", href: "/admin/ai/providers", icon: Bot, real: true },
      { label: "AI Models", href: "/admin/ai/models", icon: Brain, real: true },
      { label: "Token Usage", href: "/admin/ai/usage", icon: BarChart3, real: true },
      { label: "Prompt Templates", href: "/admin/ai/prompts", icon: Sparkles, real: true },
    ],
  },
  {
    id: "recruitment",
    label: "Recruitment",
    icon: Briefcase,
    items: [
      { label: "Global Jobs", href: "/admin/recruitment/jobs", icon: Briefcase, real: true },
      { label: "Global Candidates", href: "/admin/recruitment/candidates", icon: Users, real: true },
      { label: "Global Interviews", href: "/admin/recruitment/interviews", icon: Video, real: true },
      { label: "Question Bank", href: "/admin/recruitment/questions", icon: FileText, real: true },
    ],
  },
  {
    id: "storage",
    label: "AWS Storage",
    icon: HardDrive,
    items: [
      { label: "AWS Storage Management", href: "/admin/storage/usage", icon: HardDrive, real: true },
    ],
  },
  {
    id: "communication",
    label: "Communication",
    icon: Mail,
    items: [
      { label: "Email Templates", href: "/admin/communication/email-templates", icon: Mail, real: true },
      { label: "SMTP Setup", href: "/admin/communication/smtp", icon: Send, real: true },
      { label: "SMS", href: "/admin/communication/sms", icon: MessageSquare, real: true },
      { label: "Notifications", href: "/admin/communication/notifications", icon: Bell, real: true },
      { label: "Announcements", href: "/admin/communication/announcements", icon: Bell, real: true },
    ],
  },
  {
    id: "security",
    label: "Security & Governance",
    icon: Shield,
    items: [
      { label: "Audit Logs", href: "/admin/security/audit", icon: FileText, real: true },
      { label: "Login History", href: "/admin/security/login-history", icon: Clock, real: true },
      { label: "API Logs", href: "/admin/security/api-logs", icon: TerminalSquare, real: true },
      { label: "Threat Detection", href: "/admin/security/threats", icon: ShieldAlert, real: true },
      { label: "Roles", href: "/admin/security/roles", icon: UserCheck, real: true },
      { label: "Permissions", href: "/admin/security/permissions", icon: Lock, real: true },
      { label: "Feature Flags", href: "/admin/security/feature-flags", icon: Flag, real: true },
    ],
  },
];

export const ADMIN_DASHBOARD = { label: "Dashboard", href: "/admin", icon: LayoutDashboard };

export interface CommandEntry {
  label: string;
  href: string;
  group: string;
}

export const ADMIN_COMMANDS: CommandEntry[] = [
  { label: ADMIN_DASHBOARD.label, href: ADMIN_DASHBOARD.href, group: "General" },
  ...ADMIN_NAV.flatMap((g) => g.items.map((it) => ({ label: it.label, href: it.href, group: g.label }))),
];
