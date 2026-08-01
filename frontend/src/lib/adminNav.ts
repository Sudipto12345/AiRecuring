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
      { label: "Company Requests", href: "/admin/companies/requests", icon: Inbox },
      { label: "Company Verification", href: "/admin/companies/verification", icon: BadgeCheck },
      { label: "Company Groups", href: "/admin/companies/groups", icon: Layers },
      { label: "Company Domains", href: "/admin/companies/domains", icon: Globe },
    ],
  },
  {
    id: "users",
    label: "Users",
    icon: Users,
    items: [
      { label: "Platform Users", href: "/admin/users", icon: Users, real: true },
      { label: "Super Admins", href: "/admin/users/super-admins", icon: ShieldCheck, real: true },
      { label: "Support Staff", href: "/admin/users/support", icon: UserCog },
      { label: "Login Sessions", href: "/admin/users/sessions", icon: KeyRound },
      { label: "User Activity", href: "/admin/users/activity", icon: Activity, real: true },
    ],
  },
  {
    id: "subscription",
    label: "Subscription",
    icon: CreditCard,
    items: [
      { label: "Plans", href: "/admin/subscription/plans", icon: Layers, real: true },
      { label: "Active Subscriptions", href: "/admin/subscription/active", icon: BadgeCheck, real: true },
      { label: "Billing", href: "/admin/subscription/billing", icon: Wallet },
      { label: "Coupons", href: "/admin/subscription/coupons", icon: Ticket },
      { label: "Invoices", href: "/admin/subscription/invoices", icon: Receipt },
      { label: "Renewals", href: "/admin/subscription/renewals", icon: RefreshCw },
      { label: "Transactions", href: "/admin/subscription/transactions", icon: CreditCard },
    ],
  },
  {
    id: "ai",
    label: "AI Platform",
    icon: Bot,
    items: [
      { label: "AI Providers", href: "/admin/ai/providers", icon: Bot, real: true },
      { label: "AI Models", href: "/admin/ai/models", icon: Brain },
      { label: "AI Usage", href: "/admin/ai/usage", icon: BarChart3, real: true },
      { label: "AI Credits", href: "/admin/ai/credits", icon: Coins, real: true },
      { label: "Prompt Templates", href: "/admin/ai/prompts", icon: Sparkles },
      { label: "Embedding Models", href: "/admin/ai/embeddings", icon: Network },
      { label: "Vector Database", href: "/admin/ai/vector", icon: Database, real: true },
      { label: "AI Queue", href: "/admin/ai/queue", icon: Workflow },
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
      { label: "Templates", href: "/admin/recruitment/templates", icon: FileSpreadsheet },
    ],
  },
  {
    id: "storage",
    label: "Storage",
    icon: HardDrive,
    items: [
      { label: "File Storage", href: "/admin/storage/files", icon: FolderArchive, real: true },
      { label: "Videos", href: "/admin/storage/videos", icon: Video },
      { label: "Backups", href: "/admin/storage/backups", icon: Database },
      { label: "Storage Usage", href: "/admin/storage/usage", icon: Gauge, real: true },
      { label: "CDN", href: "/admin/storage/cdn", icon: Cloud },
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    items: [
      { label: "Platform Analytics", href: "/admin/analytics", icon: BarChart3, real: true },
      { label: "Revenue", href: "/admin/analytics/revenue", icon: Wallet },
      { label: "User Growth", href: "/admin/analytics/users", icon: Users, real: true },
      { label: "AI Usage", href: "/admin/analytics/ai", icon: Bot, real: true },
      { label: "Companies", href: "/admin/analytics/companies", icon: Building2, real: true },
      { label: "Storage", href: "/admin/analytics/storage", icon: HardDrive },
      { label: "Reports", href: "/admin/analytics/reports", icon: FileSpreadsheet },
    ],
  },
  {
    id: "communication",
    label: "Communication",
    icon: Mail,
    items: [
      { label: "Email Templates", href: "/admin/communication/email-templates", icon: Mail },
      { label: "SMTP", href: "/admin/communication/smtp", icon: Send, real: true },
      { label: "SMS", href: "/admin/communication/sms", icon: MessageSquare },
      { label: "Notifications", href: "/admin/communication/notifications", icon: Bell },
      { label: "Announcements", href: "/admin/communication/announcements", icon: Bell, real: true },
    ],
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: Plug,
    items: [
      { label: "API Keys", href: "/admin/integrations/api-keys", icon: Key },
      { label: "Webhooks", href: "/admin/integrations/webhooks", icon: Workflow },
      { label: "OAuth", href: "/admin/integrations/oauth", icon: Lock },
      { label: "Third Party Apps", href: "/admin/integrations/apps", icon: Boxes },
    ],
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
    items: [
      { label: "Audit Logs", href: "/admin/security/audit", icon: FileText, real: true },
      { label: "Login History", href: "/admin/security/login-history", icon: Clock },
      { label: "API Logs", href: "/admin/security/api-logs", icon: TerminalSquare },
      { label: "Threat Detection", href: "/admin/security/threats", icon: ShieldAlert },
      { label: "Roles", href: "/admin/security/roles", icon: UserCheck, real: true },
      { label: "Permissions", href: "/admin/security/permissions", icon: Lock, real: true },
      { label: "Feature Flags", href: "/admin/security/feature-flags", icon: Flag, real: true },
    ],
  },
  {
    id: "system",
    label: "System",
    icon: Server,
    items: [
      { label: "Settings", href: "/admin/system/settings", icon: Settings, real: true },
      { label: "Environment", href: "/admin/system/environment", icon: TerminalSquare, real: true },
      { label: "Queue Monitor", href: "/admin/system/queue", icon: Workflow },
      { label: "Redis", href: "/admin/system/redis", icon: Database, real: true },
      { label: "MongoDB", href: "/admin/system/mongodb", icon: Database, real: true },
      { label: "Health", href: "/admin/system/health", icon: Activity, real: true },
      { label: "Services", href: "/admin/system/services", icon: Server, real: true },
      { label: "Scheduler", href: "/admin/system/scheduler", icon: CalendarClock },
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
