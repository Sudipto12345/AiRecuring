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
    label: "Control Center",
    icon: Building2,
    items: [
      { label: "Company Workspaces", href: "/admin/companies", icon: Building2, real: true },
      { label: "Verification Requests", href: "/admin/companies/verification", icon: BadgeCheck, real: true },
    ],
  },
  {
    id: "users",
    label: "Users & Access",
    icon: Users,
    items: [
      { label: "Member Directory", href: "/admin/users", icon: Users, real: true },
      { label: "Super Admin Team", href: "/admin/users/super-admins", icon: ShieldCheck, real: true },
      { label: "Support & Care Team", href: "/admin/users/support", icon: UserCog, real: true },
      { label: "Active Login Sessions", href: "/admin/users/sessions", icon: KeyRound, real: true },
      { label: "User Activity Trail", href: "/admin/users/activity", icon: Activity, real: true },
    ],
  },
  {
    id: "subscription",
    label: "Billing & Growth",
    icon: CreditCard,
    items: [
      { label: "Subscription Plans", href: "/admin/subscription/plans", icon: Layers, real: true },
      { label: "Active Subscribers", href: "/admin/subscription/active", icon: BadgeCheck, real: true },
      { label: "Invoices & Billing", href: "/admin/subscription/invoices", icon: Receipt, real: true },
      { label: "Promo Coupons", href: "/admin/subscription/coupons", icon: Ticket, real: true },
      { label: "Renewals Queue", href: "/admin/subscription/renewals", icon: RefreshCw, real: true },
      { label: "Transactions History", href: "/admin/subscription/transactions", icon: CreditCard, real: true },
    ],
  },
  {
    id: "ai",
    label: "AI Engine & Bedrock",
    icon: Bot,
    items: [
      { label: "AWS Bedrock & Providers", href: "/admin/ai/providers", icon: Bot, real: true },
      { label: "AI Models & Tuning", href: "/admin/ai/models", icon: Brain, real: true },
      { label: "Token & Usage Analytics", href: "/admin/ai/usage", icon: BarChart3, real: true },
      { label: "Prompt Studio", href: "/admin/ai/prompts", icon: Sparkles, real: true },
    ],
  },
  {
    id: "recruitment",
    label: "Talent Hub",
    icon: Briefcase,
    items: [
      { label: "Published Jobs", href: "/admin/recruitment/jobs", icon: Briefcase, real: true },
      { label: "Candidate Database", href: "/admin/recruitment/candidates", icon: Users, real: true },
      { label: "AI Interviews Queue", href: "/admin/recruitment/interviews", icon: Video, real: true },
      { label: "Question Library", href: "/admin/recruitment/questions", icon: FileText, real: true },
    ],
  },
  {
    id: "security",
    label: "Security & Audits",
    icon: Shield,
    items: [
      { label: "Platform Audit Logs", href: "/admin/security/audit", icon: FileText, real: true },
      { label: "Realtime API Logs", href: "/admin/security/api-logs", icon: TerminalSquare, real: true },
      { label: "AWS Storage Usage", href: "/admin/storage/usage", icon: HardDrive, real: true },
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
