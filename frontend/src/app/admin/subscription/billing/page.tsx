"use client";

import { CreditCard, DollarSign, Wallet, AlertCircle, TrendingUp, Users } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatWidget } from "@/components/admin/StatWidget";
import { ChartCard } from "@/components/admin/ChartCard";
import { useApi } from "@/lib/swr";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { Badge } from "@/components/ui/Badge";

interface BillingStats {
  mrr: number;
  arr: number;
  totalRevenue: number;
  activeSubscriptions: number;
  failedPayments: Array<{ id: string; company: string; amount: number; date: string }>;
  recentTransactions: Array<{ id: string; company: string; plan: string; amount: number; date: string; status: string }>;
  revenueChart: Array<{ label: string; value: number }>;
}

export default function BillingPage() {
  const { data, isLoading } = useApi<BillingStats>("/admin/subscription/billing-stats");

  // Mock data fallback if API is not yet implemented
  const stats = data || {
    mrr: 15400,
    arr: 184800,
    totalRevenue: 342000,
    activeSubscriptions: 142,
    failedPayments: [
      { id: "fp_1", company: "Acme Corp", amount: 299, date: new Date().toISOString() },
    ],
    recentTransactions: [
      { id: "tx_1", company: "Acme Corp", plan: "Pro", amount: 299, date: new Date().toISOString(), status: "succeeded" },
      { id: "tx_2", company: "Globex", plan: "Growth", amount: 99, date: new Date().toISOString(), status: "succeeded" },
      { id: "tx_3", company: "Initech", plan: "Enterprise", amount: 999, date: new Date().toISOString(), status: "succeeded" },
    ],
    revenueChart: [
      { label: "Jan", value: 12000 },
      { label: "Feb", value: 12500 },
      { label: "Mar", value: 13200 },
      { label: "Apr", value: 14000 },
      { label: "May", value: 14500 },
      { label: "Jun", value: 15400 },
    ],
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Revenue & Billing"
        subtitle="Monitor platform revenue, active subscriptions, and failed payments."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatWidget label="MRR" value={`$${stats.mrr.toLocaleString()}`} icon={TrendingUp} tone="emerald" />
        <StatWidget label="ARR" value={`$${stats.arr.toLocaleString()}`} icon={DollarSign} tone="accent" />
        <StatWidget label="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon={Wallet} tone="sky" />
        <StatWidget label="Active Subscriptions" value={stats.activeSubscriptions.toString()} icon={Users} tone="accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ChartCard 
            title="Revenue Overview" 
            subtitle="Monthly recurring revenue over time" 
            type="bar" 
            data={stats.revenueChart} 
            series={[{ key: "value", color: "#10b981" }]} 
          />

          <div className="a-card p-5">
            <h3 className="text-lg font-semibold a-text mb-4">Recent Transactions</h3>
            {isLoading ? (
              <SkeletonTable columns={4} rows={3} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-sm text-[var(--color-text-secondary)]">
                      <th className="py-3 px-4 font-medium">Company</th>
                      <th className="py-3 px-4 font-medium">Plan</th>
                      <th className="py-3 px-4 font-medium text-right">Amount</th>
                      <th className="py-3 px-4 font-medium text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentTransactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-alt)] transition-colors">
                        <td className="py-4 px-4 font-medium text-[var(--color-text-primary)]">{tx.company}</td>
                        <td className="py-4 px-4 text-[var(--color-text-secondary)]">{tx.plan}</td>
                        <td className="py-4 px-4 text-right text-[var(--color-text-primary)]">${tx.amount}</td>
                        <td className="py-4 px-4 text-center">
                          <Badge variant={tx.status === "succeeded" ? "success" : "error"}>{tx.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="a-card p-5 border-rose-200">
            <h3 className="text-lg font-semibold text-rose-700 flex items-center mb-4">
              <AlertCircle className="h-5 w-5 mr-2" />
              Failed Payments
            </h3>
            {stats.failedPayments.length === 0 ? (
              <p className="text-sm text-gray-500">No failed payments at this time.</p>
            ) : (
              <div className="space-y-4">
                {stats.failedPayments.map((fp) => (
                  <div key={fp.id} className="p-4 rounded-xl bg-rose-50 border border-rose-100 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{fp.company}</p>
                      <p className="text-xs text-gray-500">{new Date(fp.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-rose-700">${fp.amount}</p>
                      <button className="text-xs font-medium text-rose-600 hover:text-rose-800 underline mt-1">
                        Retry Charge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
