"use client";

import { CreditCard, DollarSign, RefreshCw, Wallet } from "lucide-react";

import { StubModule } from "@/components/admin/StubModule";

export default function BillingPage() {
  return (
    <StubModule
      title="Billing"
      subtitle="Payment processing overview across all tenants."
      stats={[
        { label: "Collected (MTD)", value: "$18,240", icon: DollarSign, tone: "emerald" },
        { label: "Outstanding", value: "$2,110", icon: Wallet, tone: "amber" },
        { label: "Failed charges", value: 3, icon: CreditCard, tone: "rose" },
        { label: "Auto-renew on", value: "92%", icon: RefreshCw },
      ]}
      columns={[
        { key: "company", header: "Company" },
        { key: "method", header: "Method" },
        { key: "amount", header: "Amount", align: "right" },
        { key: "next", header: "Next charge" },
      ]}
      rows={[
        { company: "Enterprise Corp", method: "Visa •••• 4242", amount: "$299", next: "Jul 1" },
        { company: "Pro Startup", method: "Mastercard •••• 5511", amount: "$79", next: "Jul 4" },
        { company: "Acme QA", method: "ACH transfer", amount: "$79", next: "Jul 9" },
      ]}
      note="Billing connects to Stripe Billing once payment integration is enabled."
    />
  );
}
