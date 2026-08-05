"use client";

import { useState } from "react";
import { PageHero } from "@/components/ui/PageHero";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { CreditCard, Plus, ArrowRight } from "lucide-react";
import { useApi } from "@/lib/swr";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { getToken } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";

const PACKAGES = [
  { id: "pkg_10", credits: 10, price: 9.90 },
  { id: "pkg_50", credits: 50, price: 44.50 },
  { id: "pkg_100", credits: 100, price: 79.00 },
  { id: "pkg_500", credits: 500, price: 349.00 },
];

export default function PaymentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingPkg, setLoadingPkg] = useState<string | null>(null);
  const { data: invoices, isLoading, error } = useApi<any[]>("/billing/invoices");

  const handlePurchase = async (pkgId: string) => {
    setLoadingPkg(pkgId);
    const token = getToken();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ package_id: pkgId }),
      });
      if (!res.ok) throw new Error("Checkout failed");
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
      alert("Error initiating checkout");
    } finally {
      setLoadingPkg(null);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      <PageHero
        title="Payments & Methods"
        subtitle="Manage your payment methods and purchase additional credits."
        icon={CreditCard}
        action={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Buy Credits
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-1 h-fit">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Payment Methods</h2>
          <div className="p-6 border border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-bg-alt)] text-center">
            <CreditCard className="h-8 w-8 mx-auto text-[var(--color-text-tertiary)] mb-3" />
            <p className="text-[var(--color-text-secondary)] text-sm">
              Connect Stripe to manage payment methods
            </p>
            <Button variant="outline" className="mt-4 w-full">
              Add Payment Method
            </Button>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Payment History</h2>
          
          {isLoading ? (
            <SkeletonTable columns={4} rows={3} />
          ) : error ? (
             <div className="text-red-500 text-center py-4">Failed to load payments.</div>
          ) : !invoices?.length ? (
            <EmptyState
              title="No Payment History"
              description="You have not made any payments yet."
              icon={CreditCard}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-sm text-[var(--color-text-secondary)]">
                    <th className="py-3 px-4 font-medium">Date</th>
                    <th className="py-3 px-4 font-medium">Description</th>
                    <th className="py-3 px-4 font-medium text-right">Amount</th>
                    <th className="py-3 px-4 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id || inv._id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-alt)] transition-colors">
                      <td className="py-4 px-4 text-[var(--color-text-secondary)]">{new Date(inv.issued_at).toLocaleDateString()}</td>
                      <td className="py-4 px-4 font-medium text-[var(--color-text-primary)]">
                        {inv.credits_purchased ? `Purchased ${inv.credits_purchased} Credits` : `Invoice ${inv.id || inv._id}`}
                      </td>
                      <td className="py-4 px-4 text-right text-[var(--color-text-primary)]">${inv.amount_usd.toFixed(2)}</td>
                      <td className="py-4 px-4 text-center">
                        <Badge variant={inv.status === "paid" ? "success" : inv.status === "pending" ? "warning" : "error"}>
                          {inv.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Purchase Credits">
        <div className="p-4 space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            Select a credit package. Credits are used for CV analysis, AI generation, and more.
          </p>
          {PACKAGES.map((pkg) => (
            <div key={pkg.id} className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--admin-accent)] transition-colors cursor-pointer bg-[var(--color-bg-alt)]" onClick={() => handlePurchase(pkg.id)}>
              <div>
                <h4 className="font-semibold text-[var(--color-text-primary)]">{pkg.credits} Credits</h4>
                <p className="text-sm text-[var(--color-text-secondary)]">${pkg.price.toFixed(2)}</p>
              </div>
              <Button size="sm" variant="outline" disabled={loadingPkg === pkg.id} onClick={(e) => { e.stopPropagation(); handlePurchase(pkg.id); }}>
                {loadingPkg === pkg.id ? "Loading..." : (
                  <>Buy <ArrowRight className="h-4 w-4 ml-2" /></>
                )}
              </Button>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
