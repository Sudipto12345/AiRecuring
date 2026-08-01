"use client";

import { StubModule } from "@/components/admin/StubModule";

export default function InvoicesPage() {
  return (
    <div className="p-4 lg:p-6">
      <StubModule
        title="Invoices"
        subtitle="Billing history for your subscription."
        columns={[
          { key: "id", header: "Invoice" },
          { key: "period", header: "Period" },
          { key: "amount", header: "Amount", align: "right" },
          { key: "status", header: "Status" },
        ]}
        rows={[
          { id: "INV-2026-06", period: "Jun 2026", amount: "$0.00", status: "Paid" },
          { id: "INV-2026-05", period: "May 2026", amount: "$0.00", status: "Paid" },
        ]}
        note="Preview module. Invoices appear once paid billing is enabled for your plan."
      />
    </div>
  );
}
