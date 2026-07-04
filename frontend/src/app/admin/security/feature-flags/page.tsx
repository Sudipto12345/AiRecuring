"use client";

import { useEffect, useState } from "react";
import { Flag } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface SettingsData {
  feature_flags: Record<string, boolean>;
}

const LABELS: Record<string, string> = {
  ai_cv_ranking: "AI CV Ranking",
  exam_portal: "Exam Portal",
  interview_face: "Interview Face AI",
  semantic_search: "Semantic Search (Qdrant)",
  self_registration: "Self Registration",
  email_dispatch: "Email Dispatch",
};

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    api<SettingsData>("/admin/platform/settings").then((d) => setFlags(d.feature_flags)).catch(() => setFlags({}));
  }, []);

  async function toggle(name: string) {
    setBusy(name);
    const enabled = !flags[name];
    setFlags((f) => ({ ...f, [name]: enabled }));
    try {
      const res = await api<SettingsData>("/admin/platform/feature-flags", { method: "POST", body: { name, enabled } });
      setFlags(res.feature_flags);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Feature Flags" subtitle="Toggle platform capabilities in real time." />
      <div className="a-card a-divide overflow-hidden">
        {Object.entries(flags).map(([name, enabled]) => (
          <div key={name} className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg a-surface-2 a-accent">
                <Flag className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium a-text">{LABELS[name] ?? name}</p>
                <p className="text-xs a-faint">{name}</p>
              </div>
            </div>
            <button
              onClick={() => toggle(name)}
              disabled={busy === name}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors",
                enabled ? "bg-[var(--admin-accent)]" : "a-surface-2",
              )}
            >
              <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all", enabled ? "left-[22px]" : "left-0.5")} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
