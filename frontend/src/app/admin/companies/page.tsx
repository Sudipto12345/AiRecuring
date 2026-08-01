"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Coins,
  KeyRound,
  LogIn,
  Plus,
  Trash2,
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
      title: "Add AI Credits",
      message: "How many AI credits to add? (1 credit = $0.01)",
      defaultValue: "500",
      onConfirm: async (val) => {
        const credits = parseInt(val, 10);
        if (!Number.isFinite(credits) || credits <= 0) return;
        try {
          patch(await api<CompanyRow>(`/admin/companies/${id}/credits`, { method: "POST", body: { credits } }));
        } catch (e) {
          setAlertState({ open: true, title: "Error", message: "Failed to add credits." });
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
        title: "Password Reset",
        message: `Temporary password for the company admin:\n\n${res.temp_password}\n\nShare it securely.`,
      });
    } catch (e) {
      setAlertState({ open: true, title: "Error", message: "Failed to reset password." });
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
      title: "Delete Company",
      message: `Delete "${row.name}" and ALL its data? This cannot be undone.`,
      danger: true,
      onConfirm: async () => {
        try {
          await api(`/admin/companies/${row.id}`, { method: "DELETE" });
          setCompanies((rows) => rows.filter((r) => r.id !== row.id));
        } catch (e) {
          setAlertState({ open: true, title: "Error", message: "Failed to delete company." });
        }
      }
    });
  }

  function openDetail(row: CompanyRow) {
    drawer.open({ title: row.name, subtitle: "Company profile", node: <CompanyDetailDrawer companyId={row.id} />, width: 440 });
  }

  const columns: Column<CompanyRow>[] = [
    {
      key: "name",
      header: "Company",
      sortValue: (r) => r.name.toLowerCase(),
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--admin-accent-soft)] text-xs font-bold a-accent">
            {r.name.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <p className="font-medium a-text">{r.name}</p>
            <p className="text-xs a-faint">{r.slug}</p>
          </div>
        </div>
      ),
    },
    { key: "industry", header: "Industry", sortValue: (r) => r.industry ?? "", render: (r) => <span className="a-muted">{r.industry ?? "—"}</span> },
    { key: "seats", header: "Users", align: "right", sortValue: (r) => r.seats, render: (r) => <span className="tabular-nums">{r.seats}</span> },
    {
      key: "credits",
      header: "AI Credits",
      align: "right",
      sortValue: (r) => r.credits,
      render: (r) => <span className="font-semibold tabular-nums a-text">{r.credits.toLocaleString()}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortValue: (r) => r.status,
      render: (r) => <Badge tone={r.status === "active" ? "green" : "rose"}>{r.status}</Badge>,
    },
    {
      key: "plan",
      header: "Plan",
      sortValue: (r) => r.plan,
      render: (r) => (
        <select
          value={r.plan}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => changePlan(r.id, e.target.value)}
          className="a-input h-8 px-2 text-xs"
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
            items={[
              { label: "Login as Company", icon: LogIn, onClick: () => impersonate(r) },
              { label: "Add credits", icon: Coins, onClick: () => addCredits(r.id) },
              {
                label: r.status === "active" ? "Suspend" : "Activate",
                icon: r.status === "active" ? ArrowDownCircle : ArrowUpCircle,
                onClick: () => toggleStatus(r.id),
              },
              { label: "Reset admin password", icon: KeyRound, onClick: () => resetPassword(r.id) },
              { label: "Delete company", icon: Trash2, onClick: () => remove(r), danger: true, separatorBefore: true },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Companies"
        subtitle="Every tenant workspace on the platform."
        actions={
          <button
            onClick={() => setShowCreate(true)}
            className="gradient-brand flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" /> New Company
          </button>
        }
      />

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
            className="rounded-lg border a-border px-2.5 py-1 text-xs a-muted a-hover"
          >
            Suspend selected
          </button>
        )}
        search={(r) => `${r.name} ${r.slug} ${r.industry ?? ""} ${r.plan}`}
        searchPlaceholder="Search companies…"
        storageKey="admin-companies"
        empty="No companies yet."
      />

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setAlertState({ ...alertState, open: false })} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">{alertState.title}</h3>
            <p className="mb-6 whitespace-pre-wrap text-sm text-gray-600">{alertState.message}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setAlertState({ ...alertState, open: false })}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
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
                onClick={() => {
                  confirmState.onConfirm();
                  setConfirmState({ ...confirmState, open: false });
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${confirmState.danger ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700"}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Modal */}
      {promptState.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setPromptState({ ...promptState, open: false })} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">{promptState.title}</h3>
            <p className="mb-4 whitespace-pre-wrap text-sm text-gray-600">{promptState.message}</p>
            <input
              type="text"
              autoFocus
              defaultValue={promptState.defaultValue}
              id="prompt-input"
              className="a-input mb-6 h-10 w-full px-3 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  promptState.onConfirm(e.currentTarget.value);
                  setPromptState({ ...promptState, open: false });
                }
              }}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPromptState({ ...promptState, open: false })}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const val = (document.getElementById("prompt-input") as HTMLInputElement).value;
                  promptState.onConfirm(val);
                  setPromptState({ ...promptState, open: false });
                }}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
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
      setError(err instanceof ApiError ? err.message : "Failed to create company");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="a-elevated a-shadow-pop animate-pop relative w-full max-w-lg rounded-2xl border a-border p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold a-text">Create a new company</h3>
          <button onClick={onClose} className="a-hover rounded-lg p-1 a-muted">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Company name">
            <input required value={form.company_name} onChange={set("company_name")} className="a-input h-10 w-full px-3 text-sm" placeholder="Acme Inc." />
          </Field>
          <Field label="Industry">
            <input value={form.industry} onChange={set("industry")} className="a-input h-10 w-full px-3 text-sm" placeholder="Software" />
          </Field>
          <Field label="Admin name">
            <input required value={form.admin_name} onChange={set("admin_name")} className="a-input h-10 w-full px-3 text-sm" />
          </Field>
          <Field label="Admin email">
            <input type="email" required value={form.admin_email} onChange={set("admin_email")} className="a-input h-10 w-full px-3 text-sm" />
          </Field>
          <Field label="Temp password">
            <input type="text" required minLength={6} value={form.admin_password} onChange={set("admin_password")} className="a-input h-10 w-full px-3 text-sm" />
          </Field>
          <Field label="Plan">
            <select value={form.plan} onChange={set("plan")} className="a-input h-10 w-full px-3 text-sm">
              {plans.map((p) => (
                <option key={p.key} value={p.key}>
                  {PLAN_LABELS[p.key] ?? p.label}
                </option>
              ))}
            </select>
          </Field>
          {error && <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-500 sm:col-span-2">{error}</p>}
          <div className="sm:col-span-2">
            <button type="submit" disabled={busy} className="gradient-brand h-10 rounded-lg px-5 text-sm font-medium text-white disabled:opacity-60">
              {busy ? "Creating…" : "Create company"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium a-muted">{label}</span>
      {children}
    </label>
  );
}
