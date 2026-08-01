"use client";

import { useCallback, useEffect, useState } from "react";
import { Receipt, Plus, Printer, Trash2, X, Check } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { type Column, DataGrid } from "@/components/admin/DataGrid";
import { Badge } from "@/components/ui/Badge";
import { api, ApiError } from "@/lib/api";

interface InvoiceRow {
  id: string;
  invoice_number: string;
  company_name: string;
  subtotal: number;
  tax: number;
  total: number;
  status: "paid" | "pending" | "overdue" | "cancelled";
  due_date: string;
  created_at: string;
}

export default function InvoicesPage() {
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [printableInvoice, setPrintableInvoice] = useState<InvoiceRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<InvoiceRow[]>("/admin/billing/invoices");
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

  const columns: Column<InvoiceRow>[] = [
    {
      key: "invoice_number",
      header: "Invoice #",
      sortValue: (r) => r.invoice_number,
      render: (r) => <span className="font-mono text-sm font-semibold text-indigo-600">{r.invoice_number}</span>,
    },
    {
      key: "company_name",
      header: "Company",
      sortValue: (r) => r.company_name,
      render: (r) => <span className="font-medium text-slate-900">{r.company_name}</span>,
    },
    {
      key: "total",
      header: "Total (USD)",
      sortValue: (r) => r.total,
      render: (r) => <span className="font-bold text-slate-900">${r.total.toLocaleString()}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => {
        const tone = r.status === "paid" ? "green" : r.status === "overdue" ? "rose" : "amber";
        return <Badge tone={tone}>{r.status}</Badge>;
      },
    },
    {
      key: "due_date",
      header: "Due Date",
      render: (r) => <span className="text-xs text-slate-500">{new Date(r.due_date).toLocaleDateString()}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => (
        <button
          onClick={() => setPrintableInvoice(r)}
          className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Printer className="h-3.5 w-3.5" /> Print / View
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Invoices & Printable Statements"
        subtitle="Manage customer subscription invoices, generate billing statements, and export printable documents."
      />

      <DataGrid
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        loading={loading}
        search={(r) => `${r.invoice_number} ${r.company_name}`}
        searchPlaceholder="Search invoices…"
        storageKey="admin-invoices"
      />

      {printableInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPrintableInvoice(null)} />
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">INVOICE STATEMENT</h2>
                <p className="font-mono text-xs font-semibold text-indigo-600">{printableInvoice.invoice_number}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  <Printer className="h-4 w-4" /> Print Document
                </button>
                <button onClick={() => setPrintableInvoice(null)} className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Billed To</p>
                <p className="font-bold text-slate-900">{printableInvoice.company_name}</p>
                <p className="text-xs text-slate-500">Global Corporate Account</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-400 uppercase">Invoice Date</p>
                <p className="font-semibold text-slate-800">{new Date(printableInvoice.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-bold text-slate-600 uppercase">
                  <tr>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3">Enterprise SaaS Platform Subscription</td>
                    <td className="p-3 text-right font-semibold">${printableInvoice.subtotal.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <div className="w-64 space-y-1 text-right text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>${printableInvoice.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 border-t pt-2 text-base">
                  <span>Total Due:</span>
                  <span>${printableInvoice.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
