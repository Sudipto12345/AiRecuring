"use client";

import { useCallback, useEffect, useState } from "react";
import { UserCog, Plus, Shield, Trash2, X, Check } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { type Column, DataGrid } from "@/components/admin/DataGrid";
import { Badge } from "@/components/ui/Badge";
import { api, ApiError } from "@/lib/api";

interface SupportStaffRow {
  id: string;
  name: string;
  email: string;
  department: string;
  assigned_permissions: string[];
  created_at: string;
}

const PERMISSION_OPTIONS = [
  { id: "companies_verify", label: "Company Verification" },
  { id: "billing_manage", label: "Billing & Invoices" },
  { id: "user_support", label: "User & Password Support" },
  { id: "security_audit", label: "Security & Audit Logs" },
  { id: "recruitment_view", label: "Global Recruitment View" },
];

export default function SupportStaffPage() {
  const [rows, setRows] = useState<SupportStaffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("Support");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(["user_support"]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<SupportStaffRow[]>("/admin/users/support-staff");
      setRows(data);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const togglePermission = (permId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  async function handleCreate() {
    setBusy(true);
    setError(null);
    try {
      await api("/admin/users/support-staff", {
        method: "POST",
        body: { name, email, department, assigned_permissions: selectedPermissions },
      });
      setCreating(false);
      setName("");
      setEmail("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create support staff");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: str) {
    if (!window.confirm("Remove this support staff member?")) return;
    try {
      await api(`/admin/users/support-staff/${id}`, { method: "DELETE" });
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Delete failed");
    }
  }

  const columns: Column<SupportStaffRow>[] = [
    {
      key: "name",
      header: "Staff Member",
      sortValue: (r) => r.name,
      render: (r) => (
        <div>
          <span className="font-semibold text-slate-900">{r.name}</span>
          <p className="text-xs text-slate-500">{r.email}</p>
        </div>
      ),
    },
    {
      key: "department",
      header: "Department",
      render: (r) => <Badge tone="indigo">{r.department}</Badge>,
    },
    {
      key: "assigned_permissions",
      header: "Active Permissions",
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.assigned_permissions.map((p) => (
            <span key={p} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
              {p}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => (
        <button onClick={() => handleDelete(r.id)} className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50">
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Support Staff & RBAC Permissions"
        subtitle="Manage platform customer support accounts and grant granular module access permissions."
        actions={
          <button onClick={() => setCreating(true)} className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">
            <Plus className="h-4 w-4" /> Add Support Staff
          </button>
        }
      />

      <DataGrid
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        loading={loading}
        search={(r) => `${r.name} ${r.email} ${r.department}`}
        searchPlaceholder="Search support staff…"
        storageKey="admin-support-staff"
      />

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCreating(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">New Support Staff Member</h3>
              <button onClick={() => setCreating(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Full Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex Morgan" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Work Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@company.com" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Department</label>
                <input value={department} onChange={(e) => setDepartment(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Granular Module Permissions</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PERMISSION_OPTIONS.map((p) => {
                    const active = selectedPermissions.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePermission(p.id)}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${
                          active ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {active && <Check className="h-3.5 w-3.5" />}
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              {error && <p className="text-xs text-rose-600">{error}</p>}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setCreating(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
              <button onClick={handleCreate} disabled={busy || !name || !email} className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
                {busy ? "Saving…" : "Create Staff Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
