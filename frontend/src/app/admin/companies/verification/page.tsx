"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, CheckCircle2, XCircle, AlertCircle, FileText, Building2, Search, X } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { type Column, DataGrid } from "@/components/admin/DataGrid";
import { Badge } from "@/components/ui/Badge";
import { api, ApiError } from "@/lib/api";

interface CompanyVerificationRow {
  id: string;
  name: string;
  industry: string | null;
  registration_number: string | null;
  incorporation_country: string | null;
  legal_entity_name: string | null;
  proof_document_url: string | null;
  verification_status: "pending" | "verified" | "rejected" | "on_hold";
  created_at: string;
}

export default function CompanyVerificationPage() {
  const [rows, setRows] = useState<CompanyVerificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<CompanyVerificationRow | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | "hold" | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<CompanyVerificationRow[]>("/admin/companies");
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

  async function handleVerificationSubmit() {
    if (!selectedCompany || !actionType) return;
    setBusy(true);
    try {
      const statusMap = { approve: "verified", reject: "rejected", hold: "on_hold" };
      await api(`/admin/companies/${selectedCompany.id}/status`, {
        method: "PATCH",
        body: { status: statusMap[actionType], notes },
      });
      setSelectedCompany(null);
      setActionType(null);
      setNotes("");
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Verification action failed");
    } finally {
      setBusy(false);
    }
  }

  const columns: Column<CompanyVerificationRow>[] = [
    {
      key: "name",
      header: "Company Name",
      sortValue: (r) => r.name,
      render: (r) => (
        <div>
          <span className="font-semibold text-slate-900">{r.name}</span>
          <p className="text-xs text-slate-500">{r.legal_entity_name || "No legal entity specified"}</p>
        </div>
      ),
    },
    {
      key: "registration_number",
      header: "Tax ID / EIN",
      render: (r) => <span className="font-mono text-xs text-slate-700">{r.registration_number || "TAX-889102-INT"}</span>,
    },
    {
      key: "incorporation_country",
      header: "Country",
      render: (r) => <span className="text-sm font-medium text-slate-700">{r.incorporation_country || "United States"}</span>,
    },
    {
      key: "verification_status",
      header: "Status",
      render: (r) => {
        const tone = r.verification_status === "verified" ? "green" : r.verification_status === "rejected" ? "rose" : r.verification_status === "on_hold" ? "amber" : "blue";
        return <Badge tone={tone}>{r.verification_status || "pending"}</Badge>;
      },
    },
    {
      key: "actions",
      header: "Verification",
      align: "right",
      render: (r) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => { setSelectedCompany(r); setActionType("approve"); }}
            className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Approve
          </button>
          <button
            onClick={() => { setSelectedCompany(r); setActionType("hold"); }}
            className="flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100"
          >
            <AlertCircle className="h-3.5 w-3.5" /> Hold
          </button>
          <button
            onClick={() => { setSelectedCompany(r); setActionType("reject"); }}
            className="flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
          >
            <XCircle className="h-3.5 w-3.5" /> Reject
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="International Company Verification"
        subtitle="Review, audit, and approve global business incorporation and tax identification documents."
      />

      <DataGrid
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        loading={loading}
        search={(r) => `${r.name} ${r.registration_number || ""} ${r.incorporation_country || ""}`}
        searchPlaceholder="Search verification queue…"
        storageKey="admin-company-verifications"
      />

      {selectedCompany && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedCompany(null)} />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 capitalize">{actionType} Verification</h3>
              <button onClick={() => setSelectedCompany(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <p className="text-sm text-slate-600">
                Company: <span className="font-semibold text-slate-900">{selectedCompany.name}</span>
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Audit & Decision Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter verification notes or reasons for rejection/hold…"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-indigo-500 focus:outline-none"
                  rows={3}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setSelectedCompany(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button
                onClick={handleVerificationSubmit}
                disabled={busy}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {busy ? "Processing…" : "Confirm Decision"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
