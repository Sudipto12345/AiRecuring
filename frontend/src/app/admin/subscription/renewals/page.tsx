"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Calendar, Trash2 } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { type Column, DataGrid } from "@/components/admin/DataGrid";
import { Badge } from "@/components/ui/Badge";
import { api, ApiError } from "@/lib/api";

interface RenewalRow {
  id: string;
  company_name: string;
  plan_key: string;
  renewal_date: string;
  amount: number;
  auto_renew: boolean;
  status: "active" | "due" | "overdue" | "cancelled";
  created_at: string;
}

export default function RenewalsPage() {
  const [rows, setRows] = useState<RenewalRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<RenewalRow[]>("/admin/billing/renewals");
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

  async function handleDelete(id: string) {
    if (!window.confirm("Cancel renewal entry?")) return;
    try {
      await api(`/admin/billing/renewals/${id}`, { method: "DELETE" });
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to delete renewal");
    }
  }

  const columns: Column<RenewalRow>[] = [
    {
      key: "company_name",
      header: "Company",
      sortValue: (r) => r.company_name,
      render: (r) => <span className="font-semibold text-slate-900">{r.company_name}</span>,
    },
    {
      key: "plan_key",
      header: "Subscription Plan",
      render: (r) => <Badge tone="brand">{r.plan_key}</Badge>,
    },
    {
      key: "amount",
      header: "Renewal Price",
      render: (r) => <span className="font-bold text-slate-900">${r.amount.toLocaleString()} / mo</span>,
    },
    {
      key: "renewal_date",
      header: "Renewal Date",
      render: (r) => <span className="text-xs text-slate-600">{new Date(r.renewal_date).toLocaleDateString()}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => {
        const tone = r.status === "active" ? "green" : r.status === "overdue" ? "rose" : "amber";
        return <Badge tone={tone}>{r.status}</Badge>;
      },
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
        title="Subscription Renewals Schedule"
        subtitle="Track upcoming corporate subscription renewal schedules, auto-billing dates, and churn retention."
      />

      <DataGrid
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        loading={loading}
        search={(r) => `${r.company_name} ${r.plan_key}`}
        searchPlaceholder="Search renewals…"
        storageKey="admin-renewals"
      />
    </div>
  );
}
