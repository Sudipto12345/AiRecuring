"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Building2,
  Coins,
  Cpu,
  KeyRound,
  LogIn,
  MoreVertical,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { ActionMenu } from "@/components/admin/ActionMenu";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CompanyDetailDrawer } from "@/components/admin/CompanyDetailDrawer";
import { type Column, DataGrid } from "@/components/admin/DataGrid";
import { useDrawer } from "@/components/admin/ContextDrawer";
import { Badge } from "@/components/ui/Badge";
import { api, ApiError, startImpersonation } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PLAN_LABELS } from "@/lib/nav";
import type { CompanyRow, ImpersonateResponse, PlanInfo } from "@/lib/types";
import { LottiePlayer } from "@/components/ui/LottiePlayer";

export default function AdminCompaniesPage() {
  const { refresh } = useAuth();
  const router = useRouter();
  const drawer = useDrawer();
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [plans, setPlans] = useState<PlanInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const [alertState, setAlertState] = useState<{ open: boolean; title: string; message: string }>({ open: false, title: "", message: "" });
  const [confirmState, setConfirmState] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void; danger?: boolean }>({ open: false, title: "", message: "", onConfirm: () => {} });
  const [promptState, setPromptState] = useState<{ open: boolean; title: string; message: string; defaultValue: string; onConfirm: (val: string) => void }>({ open: false, title: "", message: "", defaultValue: "", onConfirm: () => {} });

  const load = useCallback(async () => {
    const [c, p] = await Promise.all([
      api<CompanyRow[]>("/admin/companies"),
      api<PlanInfo[]>("/admin/plans"),
    ]);
    setCompanies(c);
    setPlans(p);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const patch = (updated: CompanyRow) => setCompanies((rows) => rows.map((r) => (r.id === updated.id ? updated : r)));

  async function changePlan(id: string, plan: string) {
    patch(await api<CompanyRow>(`/admin/companies/${id}/plan`, { method: "PATCH", body: { plan } }));
  }

  async function addCredits(id: string) {
    setPromptState({
      open: true,
      title: "Allocate AI Compute Credits",
      message: "Specify token allocation amount (1k = $0.01 computational cost).",
      defaultValue: "5000",
      onConfirm: async (val) => {
        const credits = parseInt(val, 10);
        if (!Number.isFinite(credits) || credits <= 0) return;
        try {
          patch(await api<CompanyRow>(`/admin/companies/${id}/credits`, { method: "POST", body: { credits } }));
        } catch (e) {
          setAlertState({ open: true, title: "Allocation Failed", message: "Network cluster rejected credit allocation." });
        }
      }
    });
  }

  async function toggleStatus(id: string) {
    patch(await api<CompanyRow>(`/admin/companies/${id}/status`, { method: "PATCH" }));
  }

  async function resetPassword(id: string) {
    try {
      const res = await api<{ temp_password: string }>(`/admin/companies/${id}/reset-password`, { method: "POST" });
      setAlertState({
        open: true,
        title: "Enterprise IAM Reset",
        message: `Secure provisional token generated:\n\n${res.temp_password}\n\nTransmit via encrypted channels only.`,
      });
    } catch (e) {
      setAlertState({ open: true, title: "IAM Error", message: "Failed to rotate credentials." });
    }
  }

  async function impersonate(row: CompanyRow) {
    const res = await api<ImpersonateResponse>(`/admin/companies/${row.id}/impersonate`, { method: "POST" });
    startImpersonation(res.access_token, { company_name: res.company_name, user_email: res.user_email });
    await refresh();
    router.push("/dashboard");
  }

  async function remove(row: CompanyRow) {
    setConfirmState({
      open: true,
      title: "Purge Tenant Data",
      message: `Irreversibly destroy "${row.name}" and all associated vectors, users, and telemetry?`,
      danger: true,
      onConfirm: async () => {
        try {
          await api(`/admin/companies/${row.id}`, { method: "DELETE" });
          setCompanies((rows) => rows.filter((r) => r.id !== row.id));
        } catch (e) {
          setAlertState({ open: true, title: "Purge Failed", message: "Could not execute tenant deletion." });
        }
      }
    });
  }

  function openDetail(row: CompanyRow) {
    drawer.open({ title: row.name, subtitle: "Tenant Matrix", node: <CompanyDetailDrawer companyId={row.id} />, width: 440 });
  }

  const columns: Column<CompanyRow>[] = [
    {
      key: "name",
      header: "Tenant Identity",
      sortValue: (r) => r.name.toLowerCase(),
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-xs font-bold text-indigo-500 ring-1 ring-indigo-500/20">
            {r.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{r.name}</p>
            <p className="font-mono text-[11px] text-zinc-500">{r.slug}.engine.air</p>
          </div>
        </div>
      ),
    },
    { 
      key: "industry", 
      header: "Sector", 
      sortValue: (r) => r.industry ?? "", 
      render: (r) => <span className="inline-flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400"><BriefcaseIcon industry={r.industry} />{r.industry ?? "General"}</span> 
    },
    { 
      key: "seats", 
      header: "Nodes (Users)", 
      align: "right", 
      sortValue: (r) => r.seats, 
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5 font-mono text-xs text-zinc-600 dark:text-zinc-400">
          <Users className="h-3.5 w-3.5 opacity-60" />
          {r.seats}
        </div>
      )
    },
    {
      key: "credits",
      header: "Compute Quota",
      align: "right",
      sortValue: (r) => r.credits,
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          <Cpu className="h-4 w-4 text-emerald-500" />
          <span className="tabular-nums">{r.credits.toLocaleString()}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "State",
      sortValue: (r) => r.status,
      render: (r) => (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
          r.status === 'active' 
            ? 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20' 
            : 'bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/20'
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${r.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          {r.status === 'active' ? 'Online' : 'Suspended'}
        </span>
      ),
    },
    {
      key: "plan",
      header: "Tier",
      sortValue: (r) => r.plan,
      render: (r) => (
        <select
          value={r.plan}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => changePlan(r.id, e.target.value)}
          className="h-8 cursor-pointer rounded-md border border-zinc-200 bg-white/50 px-2 py-1 text-xs font-medium text-zinc-700 shadow-sm transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          {plans.map((p) => (
            <option key={p.key} value={p.key}>
              {PLAN_LABELS[p.key] ?? p.label}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: "actions",
      header: "",
      sortable: false,
      align: "right",
      render: (r) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <ActionMenu
            trigger={
              <button className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <MoreVertical className="h-4 w-4" />
              </button>
            }
            items={[
              { label: "Assume Identity", icon: LogIn, onClick: () => impersonate(r) },
              { label: "Allocate Compute", icon: Coins, onClick: () => addCredits(r.id) },
              {
                label: r.status === "active" ? "Suspend Network" : "Reactivate",
                icon: r.status === "active" ? ArrowDownCircle : ArrowUpCircle,
                onClick: () => toggleStatus(r.id),
              },
              { label: "Rotate IAM Keys", icon: KeyRound, onClick: () => resetPassword(r.id) },
              { label: "Purge Tenant", icon: Trash2, onClick: () => remove(r), danger: true, separatorBefore: true },
            ]}
          />
        </div>
      ),
    },
  ];

  // Compute top level metrics
  const activeCount = companies.filter(c => c.status === 'active').length;
  const totalSeats = companies.reduce((acc, c) => acc + c.seats, 0);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        title="Tenant Operations"
        subtitle="Manage isolation boundaries, compute quotas, and enterprise policies."
        actions={
          <button
            onClick={() => setShowCreate(true)}
            className="group relative flex h-10 items-center gap-2 overflow-hidden rounded-xl bg-zinc-900 px-4 font-medium text-white transition-transform active:scale-95 dark:bg-white dark:text-zinc-900"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 transition-opacity group-hover:opacity-100" />
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" /> 
            <span>Initialize Tenant</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 relative z-10">
        <div className="flex flex-col gap-1 rounded-2xl border border-zinc-200/60 bg-white/50 p-4 shadow-sm backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-900/50 relative overflow-hidden group">
          <div className="absolute right-[-20px] top-[-20px] opacity-10 mix-blend-screen transition-opacity group-hover:opacity-30">
             <LottiePlayer url="https://assets5.lottiefiles.com/packages/lf20_t24tpvcu.json" className="h-40 w-40 object-cover" />
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 relative z-10">
            <Building2 className="h-4 w-4" /> Active Tenants
          </div>
          <div className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {activeCount} <span className="text-sm font-normal text-zinc-400">/ {companies.length}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl border border-zinc-200/60 bg-white/50 p-4 shadow-sm backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <Users className="h-4 w-4" /> Allocated Nodes (Users)
          </div>
          <div className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {totalSeats.toLocaleString()}
          </div>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl border border-zinc-200/60 bg-white/50 p-4 shadow-sm backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <ShieldCheck className="h-4 w-4" /> IAM Security
          </div>
          <div className="text-lg font-semibold tracking-tight text-emerald-500 mt-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> 100% Hardened
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200/60 bg-white/50 shadow-sm backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-900/50 overflow-hidden">
        <DataGrid
          columns={columns}
          rows={companies}
          rowKey={(r) => r.id}
          loading={loading}
          onRowClick={openDetail}
          selectable
          bulkActions={(selected, clear) => (
            <button
              onClick={async () => {
                for (const r of selected) {
                  if (r.status === "active") await toggleStatus(r.id);
                }
                clear();
              }}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
            >
              Suspend Selected Nodes
            </button>
          )}
          search={(r) => `${r.name} ${r.slug} ${r.industry ?? ""} ${r.plan}`}
          searchPlaceholder="Query tenant matrix..."
          storageKey="admin-companies-v2"
          empty="No active tenants isolated."
        />
      </div>

      {showCreate && (
        <CreateCompanyModal
          plans={plans}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}

      {/* Alert Modal */}
      {alertState.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setAlertState({ ...alertState, open: false })} />
          <div className="relative w-full max-w-sm scale-100 rounded-3xl bg-white p-6 shadow-2xl transition-transform dark:bg-zinc-900 dark:border dark:border-zinc-800">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10">
              <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="mb-2 text-xl font-bold tracking-tight text-zinc-900 dark:text-white">{alertState.title}</h3>
            <p className="mb-6 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">{alertState.message}</p>
            <button
              onClick={() => setAlertState({ ...alertState, open: false })}
              className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition-transform active:scale-[0.98] dark:bg-white dark:text-zinc-900"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmState.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmState({ ...confirmState, open: false })} />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-900 dark:border dark:border-zinc-800">
            <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${confirmState.danger ? 'bg-rose-50 dark:bg-rose-500/10' : 'bg-indigo-50 dark:bg-indigo-500/10'}`}>
              <ShieldCheck className={`h-6 w-6 ${confirmState.danger ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'}`} />
            </div>
            <h3 className="mb-2 text-xl font-bold tracking-tight text-zinc-900 dark:text-white">{confirmState.title}</h3>
            <p className="mb-8 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">{confirmState.message}</p>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setConfirmState({ ...confirmState, open: false })}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 sm:w-auto dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Abort
              </button>
              <button
                onClick={() => {
                  confirmState.onConfirm();
                  setConfirmState({ ...confirmState, open: false });
                }}
                className={`w-full rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-transform active:scale-[0.98] sm:w-auto ${
                  confirmState.danger 
                    ? "bg-rose-500 hover:bg-rose-600" 
                    : "bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                }`}
              >
                Execute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Modal */}
      {promptState.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPromptState({ ...promptState, open: false })} />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-900 dark:border dark:border-zinc-800">
            <h3 className="mb-2 text-xl font-bold tracking-tight text-zinc-900 dark:text-white">{promptState.title}</h3>
            <p className="mb-6 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">{promptState.message}</p>
            <div className="relative mb-8">
              <input
                type="text"
                autoFocus
                defaultValue={promptState.defaultValue}
                id="prompt-input"
                className="peer w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-zinc-900 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-indigo-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    promptState.onConfirm(e.currentTarget.value);
                    setPromptState({ ...promptState, open: false });
                  }
                }}
              />
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setPromptState({ ...promptState, open: false })}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 sm:w-auto dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const val = (document.getElementById("prompt-input") as HTMLInputElement).value;
                  promptState.onConfirm(val);
                  setPromptState({ ...promptState, open: false });
                }}
                className="w-full rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-transform active:scale-[0.98] sm:w-auto dark:bg-white dark:text-zinc-900"
              >
                Allocate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BriefcaseIcon({ industry }: { industry?: string | null }) {
  // Simple helper to return a generic icon, in a real app might map industry strings to specific icons
  return <Briefcase className="h-3.5 w-3.5 opacity-60" />;
}
function Briefcase(props: any) {
  return <Building2 {...props} />;
}

function CreateCompanyModal({ plans, onClose, onCreated }: { plans: PlanInfo[]; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    company_name: "",
    industry: "",
    admin_name: "",
    admin_email: "",
    admin_password: "",
    plan: "free",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/admin/companies", { method: "POST", body: form });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to initialize tenant");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-zinc-950 dark:ring-1 dark:ring-white/10">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800/60">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">Initialize New Tenant</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Deploy a completely isolated enterprise boundary.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={submit} className="p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Field label="Tenant Identifier (Name)">
              <input required value={form.company_name} onChange={set("company_name")} className="form-input" placeholder="Acme Global" />
            </Field>
            <Field label="Sector / Industry">
              <input value={form.industry} onChange={set("industry")} className="form-input" placeholder="Financial Services" />
            </Field>
            <div className="col-span-1 sm:col-span-2 my-2 border-t border-zinc-100 dark:border-zinc-800/60" />
            <Field label="Root Admin Name">
              <input required value={form.admin_name} onChange={set("admin_name")} className="form-input" placeholder="Jane Doe" />
            </Field>
            <Field label="Root Admin Email">
              <input type="email" required value={form.admin_email} onChange={set("admin_email")} className="form-input" placeholder="jane@acme.com" />
            </Field>
            <Field label="Provisional IAM Key (Password)">
              <input type="text" required minLength={6} value={form.admin_password} onChange={set("admin_password")} className="form-input font-mono" placeholder="Sup3rSecur3..." />
            </Field>
            <Field label="Compute Tier">
              <select value={form.plan} onChange={set("plan")} className="form-input">
                {plans.map((p) => (
                  <option key={p.key} value={p.key}>
                    {PLAN_LABELS[p.key] ?? p.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {error && (
            <div className="mt-6 flex items-center gap-2 rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="mt-8 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="group relative overflow-hidden rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-transform active:scale-95 disabled:opacity-70 dark:bg-white dark:text-zinc-900">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="relative flex items-center gap-2">
                {busy ? "Deploying Boundary..." : "Deploy Tenant"}
              </span>
            </button>
          </div>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .form-input {
          @apply w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-2.5 text-sm text-zinc-900 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-indigo-500;
        }
      `}} />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{label}</span>
      {children}
    </label>
  );
}
