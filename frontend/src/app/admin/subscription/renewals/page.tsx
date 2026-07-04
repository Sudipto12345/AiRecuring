"use client";

import { Badge } from "@/components/ui/Badge";
import { StubModule } from "@/components/admin/StubModule";

export default function RenewalsPage() {
  return (
    <StubModule
      title="Renewals"
      subtitle="Upcoming subscription renewals and churn risk."
      stats={[
        { label: "Due (30d)", value: 14 },
        { label: "Auto-renew", value: 12 },
        { label: "At risk", value: 2 },
        { label: "Projected", value: "$3,180" },
      ]}
      columns={[
        { key: "company", header: "Company" },
        { key: "plan", header: "Plan" },
        { key: "renews", header: "Renews" },
        { key: "amount", header: "Amount", align: "right" },
        { key: "risk", header: "Risk" },
      ]}
      rows={[
        { company: "Enterprise Corp", plan: "Enterprise", renews: "Jul 1", amount: "$299", risk: <Badge tone="green">low</Badge> },
        { company: "Pro Startup", plan: "Professional", renews: "Jul 4", amount: "$79", risk: <Badge tone="amber">medium</Badge> },
        { company: "FaceRec Co", plan: "Enterprise", renews: "Jul 12", amount: "$299", risk: <Badge tone="rose">high</Badge> },
      ]}
      note="Renewal forecasting uses subscription cycles and usage-based churn signals."
    />
  );
}
