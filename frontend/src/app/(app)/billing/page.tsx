"use client";

import { useEffect, useState } from "react";
import { Check, Coins, Sparkles, Wallet, CreditCard, ArrowRight } from "lucide-react";

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
      <AdminPageHeader title="Billing & Plan" subtitle="Manage your subscription, modules and AI credit balance." />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatWidget label="Current plan" value={plan ? PLAN_LABELS[plan] ?? plan : "Free"} icon={Sparkles} tone="accent" />
        <StatWidget label="AI credits" value={(credits?.balance ?? session?.credits ?? 0).toLocaleString()} icon={Coins} tone="amber" />
        <StatWidget label="Modules" value={activeModules.length} icon={Check} tone="emerald" />
        <StatWidget label="Status" value={sub?.status ?? "active"} icon={Wallet} tone="sky" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <div className="a-card backdrop-blur-xl bg-white/5 dark:bg-black/20 p-5 rounded-2xl border border-white/10 dark:border-white/5 shadow-xl">
            <h3 className="mb-4 text-sm font-semibold a-text">Included Modules</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ALL_MODULES.map((m) => {
                const on = activeModules.includes(m);
                return (
                  <li key={m} className="flex items-center justify-between text-sm p-3 rounded-xl bg-black/5 dark:bg-white/5">
                    <span className="a-text font-medium">{MODULE_LABELS[m]}</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                        on ? "bg-emerald-500/10 text-emerald-500" : "bg-white/5 text-neutral-500"
                      }`}
                    >
                      {on ? <Check className="h-3 w-3" /> : null}
                      {on ? "Included" : "Add"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="a-card backdrop-blur-xl bg-white/5 dark:bg-black/20 p-5 rounded-2xl border border-white/10 dark:border-white/5 shadow-xl">
            <h3 className="mb-3 text-sm font-semibold a-text">Plan Limits</h3>
            {Object.keys(limits).length === 0 ? (
              <p className="text-sm a-faint">No specific limits on this plan.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {Object.entries(limits).map(([k, v]) => (
                  <li key={k} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <span className="capitalize a-muted">{k.replace(/([A-Z])/g, " $1")}</span>
                    <span className="font-bold a-text tabular-nums">{String(v)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="a-card backdrop-blur-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 p-6 rounded-2xl border border-indigo-500/20 dark:border-indigo-500/30 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <CreditCard className="w-24 h-24" />
            </div>
            <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-1">Top Up Credits</h3>
            <p className="text-xs text-indigo-700/70 dark:text-indigo-200/60 mb-6">Purchase more AI credits securely via Stripe</p>
            
            <div className="space-y-3 relative z-10">
              {[1000, 5000, 10000].map((amt) => (
                <button key={amt} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/40 dark:bg-black/40 hover:bg-white/60 dark:hover:bg-black/60 border border-white/30 dark:border-white/10 transition-all group shadow-sm">
                  <span className="font-bold text-sm a-text flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-500" />
                    {amt.toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    ${(amt / 100).toFixed(2)} <ArrowRight className="w-3 h-3" />
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/5 px-4 py-3 text-sm text-amber-700 dark:text-amber-400/80 backdrop-blur-md shadow-sm">
            Plan upgrades and active payment methods are managed directly through the Stripe Customer Portal.
          </div>
        </div>
      </div>
    </div>
  );
}
