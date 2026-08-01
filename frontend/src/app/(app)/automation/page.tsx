"use client";

import { ArrowRight, Bot, CheckCircle2, FileText, GraduationCap, Send, Sparkles, UserCheck } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

const STEPS = [
  { label: "Resume Uploaded", icon: FileText },
  { label: "AI Parse", icon: Bot },
  { label: "Score", icon: Sparkles },
  { label: "Shortlist", icon: UserCheck },
  { label: "Interview", icon: GraduationCap },
  { label: "Offer", icon: Send },
  { label: "Hire", icon: CheckCircle2 },
];

export default function AutomationPage() {
  return (
    <div className="space-y-5 p-4 lg:p-6">
      <AdminPageHeader title="AI Workflows" subtitle="Visual builder for your end-to-end hiring automation." draft />

      <div className="a-card overflow-x-auto p-6">
        <div className="flex min-w-max items-center gap-3">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex items-center gap-3">
                <div className="flex w-32 flex-col items-center gap-2 rounded-2xl border a-border p-4 text-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl a-accent-soft">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-medium a-text">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <ArrowRight className="h-5 w-5 shrink-0 a-faint" />}
              </div>
            );
          })}
        </div>
      </div>

      <p className="rounded-xl border border-amber-400/30 bg-amber-400/5 px-4 py-3 text-xs a-muted">
        Preview module. The visual workflow builder will let you add triggers, conditions and AI actions with drag-and-drop,
        then run them automatically as candidates progress.
      </p>
    </div>
  );
}
