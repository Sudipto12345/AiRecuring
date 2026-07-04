"use client";

import { useEffect, useState } from "react";
import { Check, Coins, Sparkles, Wallet } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatWidget } from "@/components/admin/StatWidget";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PLAN_LABELS } from "@/lib/nav";
import type { CreditBalance, ModuleKey } from "@/lib/types";

const MODULE_LABELS: Record<ModuleKey, string> = {
  cvRanking: "AI CV Ranking",
  examPortal: "Exam Portal",
  interviewFace: "AI Interviews & Proctoring",
};

const ALL_MODULES: ModuleKey[] = ["cvRanking", "examPortal", "interviewFace"];

export default function BillingPage() {
  const { session } = useAuth();
  const [credits, setCredits] = useState<CreditBalance | null>(null);

  useEffect(() => {
    api<CreditBalance>("/credits")
      .then(setCredits)
      .catch(() => {});
  }, []);

  const sub = session?.subscription;
  const plan = sub?.plan;
  const activeModules = sub?.modules ?? [];
  const limits = sub?.limits ?? {};

  return (
    <div className="space-y-5 p-4 lg:p-6">
      <AdminPageHeader title="Subscription" subtitle="Your current plan, modules and AI credit balance." />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatWidget label="Current plan" value={plan ? PLAN_LABELS[plan] ?? plan : "Free"} icon={Sparkles} tone="accent" />
        <StatWidget label="AI credits" value={(credits?.balance ?? session?.credits ?? 0).toLocaleString()} icon={Coins} tone="amber" />
        <StatWidget label="Modules" value={activeModules.length} icon={Check} tone="emerald" />
        <StatWidget label="Status" value={sub?.status ?? "active"} icon={Wallet} tone="sky" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="a-card p-5">
          <h3 className="mb-3 text-sm font-semibold a-text">Included Modules</h3>
          <ul className="space-y-2.5">
            {ALL_MODULES.map((m) => {
              const on = activeModules.includes(m);
              return (
                <li key={m} className="flex items-center justify-between text-sm">
                  <span className="a-text">{MODULE_LABELS[m]}</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                      on ? "bg-emerald-500/10 text-emerald-500" : "a-surface-2 a-faint"
                    }`}
                  >
                    {on ? <Check className="h-3 w-3" /> : null}
                    {on ? "Included" : "Not included"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="a-card p-5">
          <h3 className="mb-3 text-sm font-semibold a-text">Plan Limits</h3>
          {Object.keys(limits).length === 0 ? (
            <p className="text-sm a-faint">No specific limits on this plan.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {Object.entries(limits).map(([k, v]) => (
                <li key={k} className="flex items-center justify-between">
                  <span className="capitalize a-muted">{k.replace(/([A-Z])/g, " $1")}</span>
                  <span className="font-semibold a-text tabular-nums">{String(v)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 px-4 py-3 text-sm a-muted">
        To upgrade, downgrade or add AI credits, contact your platform administrator. Plan changes and top-ups are applied
        from the platform console.
      </div>
    </div>
  );
}
