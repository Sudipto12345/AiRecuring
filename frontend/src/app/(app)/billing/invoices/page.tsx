"use client";

import { useState } from "react";
import { PageHero } from "@/components/ui/PageHero";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { useApi } from "@/lib/swr";
import { Search, Download, FileText } from "lucide-react";
import { getToken } from "@/lib/api";

interface Invoice {
  id: string;
  invoice_number: string;
  created_at: string;
  amount_due: number;
  credits_added: number;
  status: "paid" | "pending" | "failed";
}

export default function InvoicesPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const { data: invoices, error, isLoading } = useApi<Invoice[]>("/billing/invoices");

  const filteredInvoices = invoices?.filter((inv) => {
    if (filter !== "all" && inv.status !== filter) return false;
    if (search && !inv.invoice_number.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleDownloadPdf = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const token = getToken();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/billing/invoices/${id}/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to download PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      alert("Error downloading PDF");
    }
  };

  const handleExportCsv = () => {
    if (!filteredInvoices?.length) return;
    const header = ["Invoice #", "Date", "Amount", "Credits", "Status"];
    const rows = filteredInvoices.map((inv) => [
      inv.invoice_number,
      new Date(inv.created_at).toLocaleDateString(),
      `$${(inv.amount_due / 100).toFixed(2)}`,
      inv.credits_added.toString(),
      inv.status,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "invoices.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      <PageHero
        title="Billing & Invoices"
        subtitle="Manage your billing history, review past invoices, and track payments."
        icon={FileText}
      />

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
          <div className="flex gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--color-text-tertiary)]" />
              <input
                type="text"
                placeholder="Search invoice #..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="py-2 px-4 rounded-xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)] bg-transparent"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <Button variant="outline" onClick={handleExportCsv} disabled={!filteredInvoices?.length}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {isLoading ? (
          <SkeletonTable columns={5} rows={5} />
        ) : error ? (
          <div className="text-red-500 text-center py-8">Failed to load invoices.</div>
        ) : !filteredInvoices?.length ? (
          <EmptyState
            title="No Invoices Found"
            description={search || filter !== "all" ? "Try adjusting your search or filters." : "You have no billing history yet."}
            icon={FileText}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-sm text-[var(--color-text-secondary)]">
                  <th className="py-3 px-4 font-medium">Invoice #</th>
                  <th className="py-3 px-4 font-medium">Date</th>
                  <th className="py-3 px-4 font-medium text-right">Amount</th>
                  <th className="py-3 px-4 font-medium text-right">Credits</th>
                  <th className="py-3 px-4 font-medium text-center">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-alt)] transition-colors">
                    <td className="py-4 px-4 font-medium text-[var(--color-text-primary)]">{inv.invoice_number}</td>
                    <td className="py-4 px-4 text-[var(--color-text-secondary)]">{new Date(inv.created_at).toLocaleDateString()}</td>
                    <td className="py-4 px-4 text-right text-[var(--color-text-primary)]">${(inv.amount_due / 100).toFixed(2)}</td>
                    <td className="py-4 px-4 text-right text-[var(--color-text-secondary)]">{inv.credits_added}</td>
                    <td className="py-4 px-4 text-center">
                      <Badge
                        variant={inv.status === "paid" ? "success" : inv.status === "pending" ? "warning" : "error"}
                      >
                        {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button variant="ghost" size="sm" onClick={(e) => handleDownloadPdf(inv.id, e)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
