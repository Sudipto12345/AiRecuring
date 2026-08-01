"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, Briefcase, ExternalLink, Users, Video } from "lucide-react";

import { api } from "@/lib/api";
import { PLAN_LABELS } from "@/lib/nav";
import type { CompanyDetail } from "@/lib/types";

export function CompanyDetailDrawer({ companyId }: { companyId: string }) {
  const [detail, setDetail] = useState<CompanyDetail | null>(null);

  useEffect(() => {
    api<CompanyDetail>(`/admin/companies/${companyId}`).then(setDetail).catch(() => setDetail(null));
  }, [companyId]);

  if (!detail) return <p className="text-sm a-faint">Loading…</p>;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--admin-accent-soft)] text-sm font-bold a-accent">
          {detail.name.slice(0, 2).toUpperCase()}
        </span>
        <div>
          <p className="font-semibold a-text">{detail.name}</p>
          <p className="text-xs a-faint">
            {PLAN_LABELS[detail.plan] ?? detail.plan} · {detail.credits.toLocaleString()} credits ·{" "}
            <span className={detail.status === "active" ? "text-emerald-500" : "text-rose-500"}>{detail.status}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Users", value: detail.counts.users, icon: Users },
          { label: "Jobs", value: detail.counts.jobs, icon: Briefcase },
          { label: "Candidates", value: detail.counts.candidates, icon: Users },
          { label: "Interviews", value: detail.counts.interviews, icon: Video },
        ].map((s) => (
          <div key={s.label} className="a-surface-2 rounded-xl p-3">
            <div className="flex items-center gap-2 a-faint">
              <s.icon className="h-4 w-4" />
              <span className="text-xs">{s.label}</span>
            </div>
            <p className="mt-1 text-lg font-semibold a-text tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide a-faint">Modules</p>
        <div className="flex flex-wrap gap-1.5">
          {detail.modules.length ? (
            detail.modules.map((m) => (
              <span key={m} className="rounded-md bg-[var(--admin-accent-soft)] px-2 py-0.5 text-xs a-accent">
                {m}
              </span>
            ))
          ) : (
            <span className="text-xs a-faint">No modules</span>
          )}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide a-faint">Team</p>
        <ul className="a-card a-divide overflow-hidden">
          {detail.users.map((u) => (
            <li key={u.id} className="flex items-center justify-between px-3 py-2 text-sm">
              <div className="min-w-0">
                <p className="truncate a-text">{u.name}</p>
                <p className="truncate text-xs a-faint">{u.email}</p>
              </div>
              <span className="rounded-md a-surface-2 px-2 py-0.5 text-[11px] a-muted">{u.role}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide a-faint">
          <Activity className="h-3.5 w-3.5" /> Recent activity
        </p>
        {detail.recent_activity.length ? (
          <ul className="space-y-1.5">
            {detail.recent_activity.slice(0, 8).map((a) => (
              <li key={a.id} className="flex items-center justify-between text-xs">
                <span className="a-muted">{a.action}</span>
                <span className="a-faint">{new Date(a.created_at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs a-faint">No recorded activity yet.</p>
        )}
      </div>

      <Link
        href={`/admin/companies/${companyId}`}
        className="flex items-center justify-center gap-1.5 rounded-lg border a-border px-3 py-2 text-sm a-accent a-hover"
      >
        <ExternalLink className="h-4 w-4" /> Open full profile
      </Link>
    </div>
  );
}
