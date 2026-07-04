import {
  Activity,
  Award,
  BarChart3,
  Bell,
  Bot,
  Brain,
  Briefcase,
  Building2,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  Cloud,
  Coins,
  Database,
  FileSearch,
  FileSpreadsheet,
  FileText,
  Gauge,
  Globe,
  GraduationCap,
  KanbanSquare,
  KeyRound,
  LayoutDashboard,
  Lock,
  Mail,
  MessageCircle,
  MessageSquare,
  Network,
  Palette,
  Plug,
  Receipt,
  Send,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Sliders,
  TrendingUp,
  Users,
  UserCheck,
  Video,
  Wallet,
  Workflow,
  Wand2,
} from "lucide-react";

import type { CommandEntry } from "@/lib/adminNav";
import type { ModuleKey } from "@/lib/types";

export interface CompanyNavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  /** Module gating: hidden when the subscription lacks this module. */
  module?: ModuleKey;
  real?: boolean; // wired to live API yet?
}

export interface CompanyNavGroup {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  items: CompanyNavItem[];
}

export const COMPANY_DASHBOARD = { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard };

export const COMPANY_NAV: CompanyNavGroup[] = [
  {
    id: "home",
    label: "Home",
    icon: LayoutDashboard,
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, real: true },
      { label: "AI Assistant", href: "/ai-assistant", icon: Sparkles, real: true },
      { label: "Global Search", href: "/search", icon: FileSearch },
    ],
  },
  {
    id: "recruitment",
    label: "Recruitment",
    icon: Briefcase,
    items: [
      { label: "Jobs", href: "/jobs", icon: Briefcase, module: "cvRanking", real: true },
      { label: "Candidates", href: "/candidates", icon: Users, module: "cvRanking", real: true },
      { label: "Pipeline", href: "/pipeline", icon: KanbanSquare, module: "cvRanking" },
      { label: "AI Screening", href: "/screening", icon: Bot, module: "cvRanking", real: true },
      { label: "CV Ranking", href: "/cv-ranking", icon: FileSearch, module: "cvRanking", real: true },
      { label: "Talent Pool", href: "/talent-pool", icon: Award },
      { label: "Career Portal", href: "/career-portal", icon: Globe },
    ],
  },
  {
    id: "interviews",
    label: "Interviews",
    icon: Video,
    items: [
      { label: "AI Interviews", href: "/interviews", icon: Video, module: "interviewFace", real: true },
      { label: "Live Monitoring", href: "/monitoring", icon: ShieldCheck, module: "interviewFace", real: true },
      { label: "Interview Calendar", href: "/interviews/calendar", icon: CalendarDays, module: "interviewFace" },
      { label: "Recordings", href: "/interviews/recordings", icon: Video, module: "interviewFace", real: true },
      { label: "Interview Reports", href: "/interviews/reports", icon: FileText, module: "interviewFace" },
      { label: "Question Bank", href: "/question-bank", icon: ClipboardList, module: "examPortal", real: true },
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    items: [
      { label: "Reports & Analytics", href: "/reports", icon: BarChart3, real: true },
      { label: "AI Insights", href: "/analytics/insights", icon: Brain },
      { label: "Hiring Funnel", href: "/analytics/funnel", icon: Workflow, real: true },
      { label: "Recruitment Forecast", href: "/analytics/forecast", icon: TrendingUp },
      { label: "Hiring Trends", href: "/analytics/trends", icon: Activity },
    ],
  },
  {
    id: "team",
    label: "Team",
    icon: Users,
    items: [
      { label: "Team Members", href: "/team", icon: Users, real: true },
      { label: "Roles", href: "/team/roles", icon: UserCheck },
      { label: "Departments", href: "/team/departments", icon: Building2 },
      { label: "Recruiters", href: "/team/recruiters", icon: GraduationCap },
      { label: "Activity", href: "/team/activity", icon: Activity },
    ],
  },
  {
    id: "communication",
    label: "Communication",
    icon: Mail,
    items: [
      { label: "Email Center", href: "/communication/email", icon: Mail },
      { label: "SMS", href: "/communication/sms", icon: MessageSquare },
      { label: "WhatsApp", href: "/communication/whatsapp", icon: MessageCircle },
      { label: "Notification Center", href: "/communication/notifications", icon: Bell },
      { label: "Interview Invitations", href: "/communication/invitations", icon: Send },
    ],
  },
  {
    id: "automation",
    label: "Automation",
    icon: Workflow,
    items: [
      { label: "AI Workflows", href: "/automation", icon: Workflow },
      { label: "Automation Rules", href: "/automation/rules", icon: Sliders },
      { label: "Templates", href: "/automation/templates", icon: FileSpreadsheet },
      { label: "Prompt Library", href: "/automation/prompts", icon: Wand2 },
      { label: "Resume Parsing Rules", href: "/automation/parsing", icon: FileText },
    ],
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: Plug,
    items: [
      { label: "Integrations", href: "/integrations", icon: Plug, real: true },
      { label: "Calendar", href: "/integrations/calendar", icon: CalendarRange },
      { label: "API Keys", href: "/integrations/api-keys", icon: KeyRound },
      { label: "Webhooks", href: "/integrations/webhooks", icon: Network },
    ],
  },
  {
    id: "organization",
    label: "Organization",
    icon: Building2,
    items: [
      { label: "Company Profile", href: "/organization", icon: Building2 },
      { label: "Branches", href: "/organization/branches", icon: Network },
      { label: "Careers Page", href: "/organization/careers", icon: Globe },
      { label: "Branding", href: "/organization/branding", icon: Palette },
      { label: "Domains", href: "/organization/domains", icon: Globe },
    ],
  },
  {
    id: "billing",
    label: "Billing",
    icon: Wallet,
    items: [
      { label: "Subscription", href: "/billing", icon: Wallet, real: true },
      { label: "AI Credits", href: "/billing/credits", icon: Coins, real: true },
      { label: "Usage", href: "/billing/usage", icon: Gauge, real: true },
      { label: "Storage", href: "/billing/storage", icon: Cloud },
      { label: "Invoices", href: "/billing/invoices", icon: Receipt },
      { label: "Payments", href: "/billing/payments", icon: Wallet },
    ],
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
    items: [
      { label: "Audit Logs", href: "/security/audit", icon: FileText },
      { label: "Login Sessions", href: "/security/sessions", icon: KeyRound },
      { label: "API Tokens", href: "/security/tokens", icon: KeyRound },
      { label: "Permissions", href: "/security/permissions", icon: Lock },
      { label: "Security Center", href: "/security", icon: Shield },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    items: [
      { label: "General", href: "/settings", icon: Settings, real: true },
      { label: "Preferences", href: "/settings/preferences", icon: Sliders },
      { label: "AI Models", href: "/settings/ai-models", icon: Brain },
      { label: "File Storage", href: "/settings/storage", icon: Database },
      { label: "Backup", href: "/settings/backup", icon: Cloud },
      { label: "Appearance", href: "/settings/appearance", icon: Palette },
    ],
  },
];

export const COMPANY_COMMANDS: CommandEntry[] = [
  { label: COMPANY_DASHBOARD.label, href: COMPANY_DASHBOARD.href, group: "General" },
  ...COMPANY_NAV.flatMap((g) => g.items.map((it) => ({ label: it.label, href: it.href, group: g.label }))),
];
