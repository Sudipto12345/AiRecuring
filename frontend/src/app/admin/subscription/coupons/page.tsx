"use client";

import { useCallback, useEffect, useState } from "react";
import { Ticket, Plus, Trash2, X, Check, Power } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { type Column, DataGrid } from "@/components/admin/DataGrid";
import { Badge } from "@/components/ui/Badge";
import { api, ApiError } from "@/lib/api";

interface CouponRow {
  id: string;
  code: string;
  discount_type: "percent" | "flat";
  discount_value: number;
  max_uses: number;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export default function CouponsPage() {
  const [rows, setRows] = useState<CouponRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "flat">("percent");
  const [discountValue, setDiscountValue] = useState(15);
  const [maxUses, setMaxUses] = useState(100);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<CouponRow[]>("/admin/billing/coupons");
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

  async function handleCreate() {
    setBusy(true);
    try {
      await api("/admin/billing/coupons", {
        method: "POST",
        body: { code, discount_type: discountType, discount_value: discountValue, max_uses: maxUses },
      });
      setCreating(false);
      setCode("");
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to create coupon");
    } finally {
      setBusy(false);
    }
  }

  async function handleToggle(id: string) {
    try {
      await api(`/admin/billing/coupons/${id}/toggle`, { method: "PUT" });
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to toggle coupon");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete coupon?")) return;
    try {
      await api(`/admin/billing/coupons/${id}`, { method: "DELETE" });
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to delete coupon");
    }
  }

  const columns: Column<CouponRow>[] = [
    {
      key: "code",
      header: "Coupon Code",
      sortValue: (r) => r.code,
      render: (r) => <span className="font-mono text-sm font-bold text-indigo-600 tracking-wider">{r.code}</span>,
    },
    {
      key: "discount",
      header: "Discount",
      render: (r) => (
        <span className="font-semibold text-slate-900">
          {r.discount_type === "percent" ? `${r.discount_value}% OFF` : `$${r.discount_value} OFF`}
        </span>
      ),
    },
    {
      key: "uses",
      header: "Usage",
      render: (r) => (
        <span className="text-xs text-slate-600">
          {r.used_count} / {r.max_uses} used
        </span>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      render: (r) => <Badge tone={r.is_active ? "green" : "slate"}>{r.is_active ? "Active" : "Disabled"}</Badge>,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => handleToggle(r.id)} className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50">
            <Power className="h-4 w-4" />
          </button>
          <button onClick={() => handleDelete(r.id)} className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Promotional Coupons & Discounts"
        subtitle="Create discount voucher codes, set usage limits, and manage promo campaigns."
        actions={
          <button onClick={() => setCreating(true)} className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">
            <Plus className="h-4 w-4" /> New Coupon
          </button>
        }
      />

      <DataGrid
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        loading={loading}
        search={(r) => r.code}
        searchPlaceholder="Search coupons…"
        storageKey="admin-coupons"
      />

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCreating(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Create New Coupon</h3>
              <button onClick={() => setCreating(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Coupon Code</label>
                <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="SUMMER2026" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm uppercase font-mono focus:border-indigo-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Type</label>
                  <select value={discountType} onChange={(e) => setDiscountType(e.target.value as any)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Discount Value</label>
                  <input type="number" value={discountValue} onChange={(e) => setDiscountValue(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setCreating(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
              <button onClick={handleCreate} disabled={busy || !code} className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
                {busy ? "Saving…" : "Create Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
