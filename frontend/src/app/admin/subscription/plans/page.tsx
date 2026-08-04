"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { AdminPlan, ModuleKey } from "@/lib/types";

const MODULES: { key: ModuleKey; label: string }[] = [
  { key: "cvRanking", label: "CV Ranking" },
  { key: "examPortal", label: "Exam Portal" },
  { key: "interviewFace", label: "Interview & Face AI" },
];

const NUMERIC_LIMITS = ["jobs", "cvUploadsPerMonth", "seats", "aiCredits", "storageGb", "videoUploads", "interviewMinutes"];
const BOOL_LIMITS = ["questionBank", "apiAccess", "whiteLabel", "customDomain", "integrations", "prioritySupport"];

const LIMIT_LABEL: Record<string, string> = {
  jobs: "Jobs",
  cvUploadsPerMonth: "CV uploads / mo",
  seats: "Seats",
  aiCredits: "AI credits",
  storageGb: "Storage (GB)",
  videoUploads: "Video uploads",
  interviewMinutes: "Interview minutes",
  questionBank: "Question bank",
  apiAccess: "API access",
  whiteLabel: "White-label",
  customDomain: "Custom domain",
  integrations: "Integrations",
  prioritySupport: "Priority support",
};

const fmt = (v: number | boolean) => (v === -1 ? "Unlimited" : v === true ? "Yes" : v === false ? "No" : v.toLocaleString());

export default function PlansPage() {
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [editing, setEditing] = useState<AdminPlan | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmState, setConfirmState] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({ open: false, title: "", message: "", onConfirm: () => {} });

  const load = useCallback(async () => {
    setPlans(await api<AdminPlan[]>("/admin/plan-catalog"));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(key: string) {
    setConfirmState({
      open: true,
      title: "Delete Plan",
      message: `Are you sure you want to delete plan "${key}"?`,
      onConfirm: async () => {
        try {
          await api(`/admin/plan-catalog/${key}`, { method: "DELETE" });
          load();
        } catch (e) {
          console.error(e);
        } finally {
          setConfirmState({ ...confirmState, open: false });
        }
      }
    });
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Plans"
        subtitle="Define subscription tiers, limits, and feature entitlements."
        actions={
          <button onClick={() => setCreating(true)} className="gradient-brand flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-white">
            <Plus className="h-4 w-4" /> New Plan
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((p) => (
          <div key={p.id} className="a-card flex flex-col p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold a-text">{p.label}</h3>
                <p className="text-xs a-faint">{p.key}{p.is_custom && " · custom"}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold a-text">${p.price_monthly.toLocaleString()}</p>
                <p className="text-xs a-faint">/ month</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {MODULES.map((m) => (
                <span
                  key={m.key}
                  className={cn(
                    "rounded-md px-2 py-0.5 text-[11px] font-medium",
                    p.modules.includes(m.key) ? "a-accent-soft a-accent" : "a-surface-2 a-faint line-through",
                  )}
                >
                  {m.label}
                </span>
              ))}
            </div>

            <dl className="mt-4 flex-1 space-y-1.5 text-sm">
              {[...NUMERIC_LIMITS, ...BOOL_LIMITS].map((k) =>
                p.limits[k] !== undefined ? (
                  <div key={k} className="flex items-center justify-between">
                    <dt className="a-faint">{LIMIT_LABEL[k] ?? k}</dt>
                    <dd className="a-text">{fmt(p.limits[k])}</dd>
                  </div>
                ) : null,
              )}
            </dl>

            <div className="mt-4 flex gap-2">
              <button onClick={() => setEditing(p)} className="a-hover flex flex-1 items-center justify-center gap-1.5 rounded-lg border a-border py-2 text-sm a-text">
                <Pencil className="h-4 w-4" /> Edit
              </button>
              <button onClick={() => remove(p.key)} className="a-hover flex items-center justify-center rounded-lg border a-border px-3 text-rose-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {(editing || creating) && (
        <PlanBuilder
          plan={editing}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSaved={() => {
            setEditing(null);
            setCreating(false);
            load();
          }}
        />
      )}

      {/* Confirm Modal */}
      {confirmState.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmState({ ...confirmState, open: false })} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">{confirmState.title}</h3>
            <p className="mb-6 whitespace-pre-wrap text-sm text-gray-600">{confirmState.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmState({ ...confirmState, open: false })}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmState.onConfirm}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlanBuilder({ plan, onClose, onSaved }: { plan: AdminPlan | null; onClose: () => void; onSaved: () => void }) {
  const [key, setKey] = useState(plan?.key ?? "");
  const [label, setLabel] = useState(plan?.label ?? "");
  const [price, setPrice] = useState(plan?.price_monthly ?? 0);
  const [isCustom, setIsCustom] = useState(plan?.is_custom ?? false);
  const [modules, setModules] = useState<ModuleKey[]>(plan?.modules ?? []);
  const [limits, setLimits] = useState<Record<string, number | boolean>>(() => {
    const base: Record<string, number | boolean> = {};
    NUMERIC_LIMITS.forEach((k) => (base[k] = (plan?.limits[k] as number) ?? 0));
    BOOL_LIMITS.forEach((k) => (base[k] = (plan?.limits[k] as boolean) ?? false));
    return base;
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const toggleModule = (m: ModuleKey) => setModules((cur) => (cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m]));

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await api("/admin/plan-catalog", {
        method: "POST",
        body: { key, label, modules, limits, price_monthly: Number(price), is_custom: isCustom, order: plan?.order ?? 99 },
      });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="a-elevated a-shadow-pop animate-pop relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl border a-border p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold a-text">{plan ? `Edit ${plan.label}` : "New plan"}</h3>
          <button onClick={onClose} className="a-hover rounded-lg p-1 a-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium a-muted">Key</span>
            <input value={key} disabled={!!plan} onChange={(e) => setKey(e.target.value)} className="a-input h-10 w-full px-3 text-sm disabled:opacity-60" placeholder="growth" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium a-muted">Label</span>
            <input value={label} onChange={(e) => setLabel(e.target.value)} className="a-input h-10 w-full px-3 text-sm" placeholder="Growth" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium a-muted">Price / mo (USD)</span>
            <input type="number" min="0" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="a-input h-10 w-full px-3 text-sm" />
          </label>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide a-faint">Modules</p>
          <div className="flex flex-wrap gap-2">
            {MODULES.map((m) => (
              <button
                key={m.key}
                onClick={() => toggleModule(m.key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm",
                  modules.includes(m.key) ? "border-indigo-600 a-accent-soft a-accent" : "a-border a-muted",
                )}
              >
                {modules.includes(m.key) && <Check className="h-3.5 w-3.5" />}
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide a-faint">Numeric limits (use -1 for unlimited)</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {NUMERIC_LIMITS.map((k) => (
              <label key={k} className="block">
                <span className="mb-1 block text-xs a-muted">{LIMIT_LABEL[k]}</span>
                <input
                  type="number"
                  min="-1"
                  value={limits[k] as number}
                  onChange={(e) => setLimits((l) => ({ ...l, [k]: Number(e.target.value) }))}
                  className="a-input h-9 w-full px-3 text-sm"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide a-faint">Feature toggles</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {BOOL_LIMITS.map((k) => (
              <button
                key={k}
                onClick={() => setLimits((l) => ({ ...l, [k]: !l[k] }))}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-3 py-2 text-sm",
                  limits[k] ? "border-indigo-600 a-accent-soft a-accent" : "a-border a-muted",
                )}
              >
                {LIMIT_LABEL[k]}
                {limits[k] ? <Check className="h-4 w-4" /> : <X className="h-4 w-4 opacity-40" />}
              </button>
            ))}
          </div>
        </div>

        <label className="mt-5 flex items-center gap-2 text-sm a-muted">
          <input type="checkbox" checked={isCustom} onChange={(e) => setIsCustom(e.target.checked)} className="accent-indigo-600" />
          Custom (negotiated) plan
        </label>

        {error && <p className="mt-4 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-500">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="a-hover rounded-lg border a-border px-4 py-2 text-sm a-muted">Cancel</button>
          <button onClick={save} disabled={busy || !key || !label} className="gradient-brand rounded-lg px-5 py-2 text-sm font-medium text-white disabled:opacity-60">
            {busy ? "Saving…" : "Save plan"}
          </button>
        </div>
      </div>
    </div>
  );
}
