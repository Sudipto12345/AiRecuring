"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, Briefcase, ExternalLink, ShieldCheck, Users, Video } from "lucide-react";

import { api } from "@/lib/api";
import { PLAN_LABELS } from "@/lib/nav";
import type { CompanyDetail } from "@/lib/types";

export function CompanyDetailDrawer({ companyId }: { companyId: string }) {
  const [detail, setDetail] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api<CompanyDetail>(`/admin/companies/${companyId}`)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [companyId]);

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          Loading workspace details…
        </div>
      </div>
    );
  }

  if (!detail) {
    return <p className="text-xs text-slate-500">Failed to load company profile.</p>;
  }

  return (
    <div className="space-y-5 text-xs">
      {/* Brand & Plan Header */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm font-bold text-indigo-300">
          {detail.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-white truncate">{detail.name}</p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            {PLAN_LABELS[detail.plan] ?? detail.plan} · {detail.credits.toLocaleString()} credits ·{" "}
            <span className={detail.status === "active" ? "text-emerald-400" : "text-rose-400"}>
              {detail.status}
            </span>
          </p>
        </div>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { label: "Users", value: detail.counts.users, icon: Users },
          { label: "Jobs", value: detail.counts.jobs, icon: Briefcase },
          { label: "Candidates", value: detail.counts.candidates, icon: Users },
          { label: "Interviews", value: detail.counts.interviews, icon: Video },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="flex items-center gap-1.5 text-slate-400">
              <s.icon className="h-3.5 w-3.5" />
              <span className="text-[11px]">{s.label}</span>
            </div>
            <p className="mt-1 text-base font-bold text-white tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Enabled Modules */}
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Enabled Modules</p>
        <div className="flex flex-wrap gap-1.5">
          {detail.modules.length ? (
            detail.modules.map((m) => (
              <span key={m} className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-medium text-indigo-300">
                {m}
              </span>
            ))
          ) : (
            <span className="text-slate-500">No active modules</span>
          )}
        </div>
      </div>

      {/* Business Identity */}
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Business Verification</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            ["Registration", detail.registration_number ?? "—"],
            ["Country", detail.incorporation_country ?? "—"],
            ["Legal Entity", detail.legal_entity_name ?? "—"],
            ["Verification Status", detail.verification_status ?? "verified"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
              <p className="text-[10px] text-slate-500">{label}</p>
              <p className="mt-0.5 truncate font-medium text-slate-200">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team Members */}
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Team Accounts</p>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] divide-y divide-white/[0.04]">
          {detail.users.map((u) => (
            <div key={u.id} className="flex items-center justify-between px-3 py-2">
              <div className="min-w-0 pr-2">
                <p className="truncate font-medium text-white">{u.name}</p>
                <p className="truncate text-[10px] text-slate-500">{u.email}</p>
              </div>
              <span className="rounded bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-400 font-medium">
                {u.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <p className="mb-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          <Activity className="h-3 w-3 text-indigo-400" /> Recent Audit Activity
        </p>
        {detail.recent_activity.length ? (
          <div className="space-y-1.5">
            {detail.recent_activity.slice(0, 6).map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.01] px-2.5 py-1.5 text-[11px]">
                <span className="text-slate-300 truncate">{a.action}</span>
                <span className="text-slate-500 flex-none">{new Date(a.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">No activity recorded yet.</p>
        )}
      </div>

      {/* Profile Deep Link */}
      <Link
        href={`/admin/companies/${companyId}`}
        className="flex items-center justify-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition-all shadow-sm"
      >
        <ExternalLink className="h-3.5 w-3.5" /> Full Workspace Management
      </Link>
    </div>
  );
}
