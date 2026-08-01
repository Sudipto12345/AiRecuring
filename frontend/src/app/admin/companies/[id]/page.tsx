"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Briefcase, Users, Video } from "lucide-react";

import { PreviewChip } from "@/components/admin/PreviewChip";
import { api } from "@/lib/api";
import { PLAN_LABELS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import type { CompanyDetail } from "@/lib/types";

const TABS = ["Overview", "Users", "Subscription", "AI Usage", "Activity", "Invoices", "Storage", "Settings"] as const;
type Tab = (typeof TABS)[number];
const MOCK_TABS: Tab[] = ["Invoices", "Storage", "Settings"];

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [detail, setDetail] = useState<CompanyDetail | null>(null);
  const [tab, setTab] = useState<Tab>("Overview");

  useEffect(() => {
    api<CompanyDetail>(`/admin/companies/${id}`).then(setDetail).catch(() => setDetail(null));
  }, [id]);

  if (!detail) return <p className="text-sm a-faint">Loading company…</p>;

  return (
    <div className="space-y-5">
      <button onClick={() => router.push("/admin/companies")} className="flex items-center gap-1.5 text-sm a-muted hover:a-text">
        <ArrowLeft className="h-4 w-4" /> All companies
      </button>

      <div className="a-card flex flex-wrap items-center gap-4 p-5">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--admin-accent-soft)] text-lg font-bold a-accent">
          {detail.name.slice(0, 2).toUpperCase()}
        </span>
        <div className="flex-1">
          <h1 className="text-xl font-semibold a-text">{detail.name}</h1>
          <p className="text-sm a-faint">
            {detail.industry ?? "—"} · {detail.slug} · joined {new Date(detail.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-[var(--admin-accent-soft)] px-3 py-1.5 text-sm font-medium a-accent">
            {PLAN_LABELS[detail.plan] ?? detail.plan}
          </span>
          <span className={cn("rounded-lg px-3 py-1.5 text-sm font-medium", detail.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500")}>
            {detail.status}
          </span>
          <span className="rounded-lg a-surface-2 px-3 py-1.5 text-sm a-muted">{detail.credits.toLocaleString()} credits</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 border-b a-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm",
              tab === t ? "border-[var(--admin-accent)] a-accent font-medium" : "border-transparent a-muted hover:a-text",
            )}
          >
            {t}
            {MOCK_TABS.includes(t) && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Users", value: detail.counts.users, icon: Users },
            { label: "Jobs", value: detail.counts.jobs, icon: Briefcase },
            { label: "Candidates", value: detail.counts.candidates, icon: Users },
            { label: "Interviews", value: detail.counts.interviews, icon: Video },
          ].map((s) => (
            <div key={s.label} className="a-card p-4">
              <div className="flex items-center gap-2 a-faint">
                <s.icon className="h-4 w-4" />
                <span className="text-xs">{s.label}</span>
              </div>
              <p className="mt-1 text-2xl font-semibold a-text tabular-nums">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "Users" && (
        <div className="a-card a-divide overflow-hidden">
          {detail.users.map((u) => (
            <div key={u.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium a-text">{u.name}</p>
                <p className="text-xs a-faint">{u.email}</p>
              </div>
              <span className="rounded-md a-surface-2 px-2 py-1 text-xs a-muted">{u.role}</span>
            </div>
          ))}
          {detail.users.length === 0 && <p className="px-4 py-8 text-center text-sm a-faint">No users.</p>}
        </div>
      )}

      {tab === "Subscription" && (
        <div className="a-card p-5">
          <p className="mb-3 text-sm font-semibold a-text">Plan limits — {PLAN_LABELS[detail.plan] ?? detail.plan}</p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {Object.entries(detail.limits).map(([k, v]) => (
              <div key={k} className="a-surface-2 rounded-lg px-3 py-2">
                <p className="text-xs a-faint">{k}</p>
                <p className="text-sm font-medium a-text">{v === -1 ? "Unlimited" : v === true ? "Yes" : v === false ? "No" : String(v)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {detail.modules.map((m) => (
              <span key={m} className="rounded-md bg-[var(--admin-accent-soft)] px-2 py-0.5 text-xs a-accent">{m}</span>
            ))}
          </div>
        </div>
      )}

      {tab === "AI Usage" && (
        <div className="a-card p-5">
          <p className="text-sm a-muted">
            Credit balance: <strong className="a-text">{detail.credits.toLocaleString()}</strong>
          </p>
          <p className="mt-2 text-xs a-faint">Detailed per-company AI breakdown is available in AI Platform → AI Usage.</p>
        </div>
      )}

      {tab === "Activity" && (
        <div className="a-card a-divide overflow-hidden">
          {detail.recent_activity.length ? (
            detail.recent_activity.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <div>
                  <span className="a-text">{a.action}</span>
                  <span className="ml-2 text-xs a-faint">by {a.actor_email}</span>
                </div>
                <span className="text-xs a-faint">{new Date(a.created_at).toLocaleString()}</span>
              </div>
            ))
          ) : (
            <p className="px-4 py-8 text-center text-sm a-faint">No activity recorded.</p>
          )}
        </div>
      )}

      {MOCK_TABS.includes(tab) && (
        <div className="a-card p-6">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="text-sm font-semibold a-text">{tab}</h3>
            <PreviewChip />
          </div>
          <p className="text-sm a-muted">
            {tab === "Invoices" && "Invoice history and PDF downloads appear here once billing (Stripe) is connected."}
            {tab === "Storage" && "Per-tenant storage usage by bucket and file type, backed by MinIO metering."}
            {tab === "Settings" && "Tenant-level configuration overrides, SSO, and data residency controls."}
          </p>
        </div>
      )}
    </div>
  );
}
