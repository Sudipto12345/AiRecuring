"use client";

import { useCallback, useEffect, useState } from "react";
import { KeyRound, ShieldCheck, Plus, X } from "lucide-react";

import { ActionMenu } from "@/components/admin/ActionMenu";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { type Column, DataGrid } from "@/components/admin/DataGrid";
import { Avatar } from "@/components/ui/Avatar";
import { api, ApiError } from "@/lib/api";
import type { AdminUserRow, Role } from "@/lib/types";

const ROLE_TONE: Record<string, string> = {
  super_admin: "bg-amber-500/10 text-amber-500",
  company_admin: "bg-[var(--admin-accent-soft)] a-accent",
  hr: "bg-emerald-500/10 text-emerald-500",
  interviewer: "bg-sky-500/10 text-sky-500",
};
const ROLES: Role[] = ["super_admin", "company_admin", "hr", "interviewer"];

export default function PlatformUsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const [alertState, setAlertState] = useState<{ open: boolean; title: string; message: string }>({ open: false, title: "", message: "" });
  const [confirmState, setConfirmState] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({ open: false, title: "", message: "", onConfirm: () => {} });

  const load = useCallback(async () => {
    const [u, c] = await Promise.all([
      api<AdminUserRow[]>("/admin/users"),
      api<{ id: string; name: string }[]>("/admin/companies"),
    ]);
    setUsers(u);
    setCompanies(c);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function resetPassword(id: string) {
    try {
      const res = await api<{ temp_password: string }>(`/admin/users/${id}/reset-password`, { method: "POST" });
      setAlertState({
        open: true,
        title: "Password Reset",
        message: `Temporary password:\n\n${res.temp_password}`,
      });
    } catch (e) {
      setAlertState({ open: true, title: "Error", message: "Failed to reset password." });
    }
  }

  async function changeRole(id: string, role: string) {
    try {
      const updated = await api<AdminUserRow>(`/admin/users/${id}/role?role=${role}`, { method: "PATCH" });
      setUsers((rows) => rows.map((u) => (u.id === id ? updated : u)));
    } catch (e) {
      setAlertState({ open: true, title: "Error", message: "Failed to change role." });
    }
  }

  async function removeUser(id: string) {
    setConfirmState({
      open: true,
      title: "Remove User",
      message: "Are you sure you want to completely remove this user? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await api(`/admin/users/${id}`, { method: "DELETE" });
          setUsers((rows) => rows.filter((u) => u.id !== id));
          setConfirmState({ ...confirmState, open: false });
        } catch (e) {
          setConfirmState({ ...confirmState, open: false });
          setAlertState({ open: true, title: "Error", message: "Failed to remove user." });
        }
      }
    });
  }

  const columns: Column<AdminUserRow>[] = [
    {
      key: "name",
      header: "User",
      sortValue: (r) => r.name.toLowerCase(),
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={r.name} size="sm" />
          <div>
            <p className="font-medium a-text">{r.name}</p>
            <p className="text-xs a-faint">{r.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortValue: (r) => r.role,
      render: (r) => <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${ROLE_TONE[r.role] ?? "a-surface-2"}`}>{r.role}</span>,
    },
    { key: "company_name", header: "Company", sortValue: (r) => r.company_name ?? "", render: (r) => <span className="a-muted">{r.company_name ?? "—"}</span> },
    { key: "title", header: "Title", render: (r) => <span className="a-muted">{r.title ?? "—"}</span> },
    {
      key: "created_at",
      header: "Joined",
      sortValue: (r) => r.created_at,
      render: (r) => <span className="a-faint">{new Date(r.created_at).toLocaleDateString()}</span>,
    },
    {
      key: "actions",
      header: "",
      sortable: false,
      align: "right",
      render: (r) => (
        <div className="flex justify-end">
          <ActionMenu
            items={[
              { label: "Reset password", icon: KeyRound, onClick: () => resetPassword(r.id) },
              ...ROLES.filter((role) => role !== r.role).map((role) => ({
                label: `Make ${role}`,
                icon: ShieldCheck,
                onClick: () => changeRole(r.id, role),
              })),
              { label: "Remove User", icon: X, onClick: () => removeUser(r.id) },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Platform Users"
        subtitle="Every user across all tenants."
        actions={
          <button
            onClick={() => setShowCreate(true)}
            className="gradient-brand flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" /> New User
          </button>
        }
      />
      <DataGrid
        columns={columns}
        rows={users}
        rowKey={(r) => r.id}
        loading={loading}
        search={(r) => `${r.name} ${r.email} ${r.role} ${r.company_name ?? ""}`}
        searchPlaceholder="Search users…"
        storageKey="admin-users"
      />

      {showCreate && (
        <CreateUserModal
          companies={companies}
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

function CreateUserModal({
  companies,
  onClose,
  onCreated,
}: {
  companies: { id: string; name: string }[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "super_admin",
    company_id: "",
    title: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.value;
    setForm((f) => ({
      ...f,
      [k]: val,
      ...(k === "role" && val === "super_admin" ? { company_id: "" } : {}),
    }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body = {
        ...form,
        company_id: form.company_id || null,
        title: form.title || null,
      };
      await api("/admin/users", { method: "POST", body });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create user");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="a-elevated a-shadow-pop animate-pop relative w-full max-w-lg rounded-2xl border a-border p-6 bg-white">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold a-text">Create a new user</h3>
          <button onClick={onClose} className="a-hover rounded-lg p-1 a-muted">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <input required value={form.name} onChange={set("name")} className="a-input h-10 w-full px-3 text-sm" placeholder="John Doe" />
          </Field>
          <Field label="Email address">
            <input type="email" required value={form.email} onChange={set("email")} className="a-input h-10 w-full px-3 text-sm" placeholder="john@example.com" />
          </Field>
          <Field label="Password">
            <input type="password" required minLength={6} value={form.password} onChange={set("password")} className="a-input h-10 w-full px-3 text-sm" placeholder="••••••" />
          </Field>
          <Field label="Role">
            <select value={form.role} onChange={set("role")} className="a-input h-10 w-full px-3 text-sm bg-white">
              <option value="super_admin">Super Admin</option>
              <option value="company_admin">Company Admin</option>
              <option value="hr">HR</option>
              <option value="interviewer">Interviewer</option>
            </select>
          </Field>
          {form.role !== "super_admin" && (
            <Field label="Company">
              <select required value={form.company_id} onChange={set("company_id")} className="a-input h-10 w-full px-3 text-sm bg-white">
                <option value="">Select company...</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Field label="Job title (optional)">
            <input value={form.title} onChange={set("title")} className="a-input h-10 w-full px-3 text-sm" placeholder="HR Manager" />
          </Field>
          {error && <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-500 sm:col-span-2">{error}</p>}
          <div className="sm:col-span-2">
            <button type="submit" disabled={busy} className="gradient-brand h-10 rounded-lg px-5 text-sm font-medium text-white disabled:opacity-60">
              {busy ? "Creating…" : "Create user"}
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
