import {
  BarChart3,
  Bot,
  Briefcase,
  ClipboardList,
  FileSearch,
  LayoutDashboard,
  ListChecks,
  Plug,
  Settings,
  ShieldCheck,
  Users,
  Video,
} from "lucide-react";

import type { ModuleKey } from "@/lib/types";

export interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  module?: ModuleKey;
}

export interface NavSection {
  heading?: string;
  items: NavItem[];
}

export const NAV: NavSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Candidates", href: "/candidates", icon: Users, module: "cvRanking" },
      { label: "AI Screening", href: "/screening", icon: Bot, module: "cvRanking" },
      { label: "AI Interviews", href: "/interviews", icon: Video, module: "interviewFace" },
      { label: "Exam Management", href: "/exams", icon: ClipboardList, module: "examPortal" },
      { label: "CV Ranking", href: "/cv-ranking", icon: FileSearch, module: "cvRanking" },
      { label: "Jobs", href: "/jobs", icon: Briefcase, module: "cvRanking" },
    ],
  },
  {
    heading: "Tools",
    items: [
      { label: "Question Bank", href: "/question-bank", icon: ListChecks, module: "examPortal" },
    ],
  },
  {
    heading: "Settings",
    items: [{ label: "Settings", href: "/settings", icon: Settings }],
  },
];

export const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  enterprise: "Enterprise",
};
