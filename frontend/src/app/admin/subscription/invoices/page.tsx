"use client";

import { Badge } from "@/components/ui/Badge";
import { StubModule } from "@/components/admin/StubModule";

export default function InvoicesPage() {
  return (
    <StubModule
      title="Invoices"
      subtitle="Generated invoices and their payment state."
      stats={[
        { label: "Issued (MTD)", value: 38 },
        { label: "Paid", value: 33 },
        { label: "Open", value: 4 },
        { label: "Overdue", value: 1 },
      ]}
      columns={[
        { key: "number", header: "Invoice" },
        { key: "company", header: "Company" },
        { key: "amount", header: "Amount", align: "right" },
        { key: "issued", header: "Issued" },
        { key: "status", header: "Status" },
      ]}
      rows={[
        { number: "INV-2041", company: "Enterprise Corp", amount: "$299", issued: "Jun 1", status: <Badge tone="green">paid</Badge> },
        { number: "INV-2042", company: "Pro Startup", amount: "$79", issued: "Jun 4", status: <Badge tone="green">paid</Badge> },
        { number: "INV-2055", company: "Acme QA", amount: "$79", issued: "Jun 9", status: <Badge tone="amber">open</Badge> },
        { number: "INV-2061", company: "FaceRec Co", amount: "$299", issued: "May 28", status: <Badge tone="rose">overdue</Badge> },
      ]}
      note="Invoice PDFs and tax handling are produced by Stripe Invoicing."
    />
  );
}
