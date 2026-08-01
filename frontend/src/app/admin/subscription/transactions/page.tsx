"use client";

import { Badge } from "@/components/ui/Badge";
import { StubModule } from "@/components/admin/StubModule";

export default function TransactionsPage() {
  return (
    <StubModule
      title="Transactions"
      subtitle="Payment transaction ledger."
      stats={[
        { label: "Volume (MTD)", value: "$18,240" },
        { label: "Transactions", value: 41 },
        { label: "Refunds", value: "$158" },
        { label: "Disputes", value: 0 },
      ]}
      columns={[
        { key: "id", header: "Transaction" },
        { key: "company", header: "Company" },
        { key: "amount", header: "Amount", align: "right" },
        { key: "type", header: "Type" },
        { key: "status", header: "Status" },
      ]}
      rows={[
        { id: "txn_8841", company: "Enterprise Corp", amount: "$299", type: "Subscription", status: <Badge tone="green">succeeded</Badge> },
        { id: "txn_8842", company: "Pro Startup", amount: "$79", type: "Subscription", status: <Badge tone="green">succeeded</Badge> },
        { id: "txn_8851", company: "Acme QA", amount: "-$20", type: "Refund", status: <Badge tone="slate">refunded</Badge> },
      ]}
      note="Transaction ledger mirrors Stripe Payment Intents and Balance transactions."
    />
  );
}
