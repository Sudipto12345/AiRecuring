"use client";

import { useState, useEffect } from "react";
import { PageHero } from "@/components/ui/PageHero";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { Coins, Plus, ArrowRight } from "lucide-react";
import { useApi } from "@/lib/swr";
import { getToken } from "@/lib/api";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { CreditBalance, CreditTxn } from "@/lib/types";

const PACKAGES = [
  { id: "pkg_10", credits: 10, price: 9.90 },
  { id: "pkg_50", credits: 50, price: 44.50 },
  { id: "pkg_100", credits: 100, price: 79.00 },
  { id: "pkg_500", credits: 500, price: 349.00 },
];

export default function CreditsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingPkg, setLoadingPkg] = useState<string | null>(null);
  
  const { data, error, isLoading } = useApi<CreditBalance>("/credits");

  const handlePurchase = async (pkgId: string) => {
    setLoadingPkg(pkgId);
    const token = getToken();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/billing/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ package_id: pkgId }),
      });
      if (!res.ok) throw new Error("Checkout failed");
      const result = await res.json();
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      console.error(err);
      alert("Error initiating checkout");
    } finally {
      setLoadingPkg(null);
    }
  };

  const usageBreakdown = [
    { label: "CV Analysis", value: 35, color: "bg-blue-500" },
    { label: "AI Questions", value: 40, color: "bg-purple-500" },
    { label: "AI Scoring", value: 15, color: "bg-emerald-500" },
    { label: "Embeddings", value: 10, color: "bg-amber-500" },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      <PageHero
        title="AI Credits Wallet"
        subtitle="Monitor your credit balance, review usage, and top up your account."
        icon={Coins}
        action={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Top Up Credits
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-8 lg:col-span-1 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 rounded-full bg-[var(--admin-accent)]/10 flex items-center justify-center mb-4">
            <Coins className="h-10 w-10 text-[var(--admin-accent)]" />
          </div>
          <p className="text-[var(--color-text-secondary)] font-medium mb-1">Current Balance</p>
          <h2 className="text-5xl font-bold text-[var(--color-text-primary)]">
            {isLoading ? "..." : (data?.balance ?? 0).toLocaleString()}
          </h2>
          <Button className="mt-6 w-full" onClick={() => setIsModalOpen(true)}>Top Up Now</Button>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">Usage Breakdown</h2>
          <div className="space-y-6">
            {usageBreakdown.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-[var(--color-text-primary)]">{item.label}</span>
                  <span className="text-[var(--color-text-secondary)]">{item.value}%</span>
                </div>
                <div className="h-2 w-full bg-[var(--color-bg-alt)] rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Credits History</h2>
        
        {isLoading ? (
          <SkeletonTable columns={4} rows={5} />
        ) : error ? (
          <div className="text-red-500 text-center py-4">Failed to load history.</div>
        ) : !data?.transactions?.length ? (
          <EmptyState
            title="No Credit History"
            description="You haven't used or purchased any credits yet."
            icon={Coins}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-sm text-[var(--color-text-secondary)]">
                  <th className="py-3 px-4 font-medium">Date</th>
                  <th className="py-3 px-4 font-medium">Action</th>
                  <th className="py-3 px-4 font-medium text-right">Amount</th>
                  <th className="py-3 px-4 font-medium text-right">Balance After</th>
                </tr>
              </thead>
              <tbody>
                {data.transactions.map((txn: CreditTxn) => (
                  <tr key={txn.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-alt)] transition-colors">
                    <td className="py-4 px-4 text-[var(--color-text-secondary)]">{new Date(txn.created_at).toLocaleString()}</td>
                    <td className="py-4 px-4 font-medium text-[var(--color-text-primary)]">{txn.reason}</td>
                    <td className="py-4 px-4 text-right font-medium">
                      <span className={txn.kind === "grant" ? "text-emerald-500" : "text-rose-500"}>
                        {txn.kind === "grant" ? "+" : "-"}{txn.credits}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-[var(--color-text-secondary)]">{txn.balance_after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Top Up Credits">
        <div className="p-4 space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            Select a package to add to your balance.
          </p>
          {PACKAGES.map((pkg) => (
            <div key={pkg.id} className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--admin-accent)] transition-colors cursor-pointer bg-[var(--color-bg-alt)]" onClick={() => handlePurchase(pkg.id)}>
              <div>
                <h4 className="font-semibold text-[var(--color-text-primary)]">{pkg.credits} Credits</h4>
                <p className="text-sm text-[var(--color-text-secondary)]">${pkg.price.toFixed(2)}</p>
              </div>
              <Button size="sm" variant="outline" disabled={loadingPkg === pkg.id} onClick={(e) => { e.stopPropagation(); handlePurchase(pkg.id); }}>
                {loadingPkg === pkg.id ? "Loading..." : (
                  <>Top Up <ArrowRight className="h-4 w-4 ml-2" /></>
                )}
              </Button>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
