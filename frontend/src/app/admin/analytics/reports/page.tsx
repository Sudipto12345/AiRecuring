"use client";

import { Badge } from "@/components/ui/Badge";
import { StubModule } from "@/components/admin/StubModule";

export default function ReportsPage() {
  return (
    <StubModule
      title="Reports"
      subtitle="Scheduled and on-demand platform reports."
      stats={[
        { label: "Saved reports", value: 12 },
        { label: "Scheduled", value: 5 },
        { label: "Generated (MTD)", value: 38 },
        { label: "Recipients", value: 9 },
      ]}
      columns={[
        { key: "name", header: "Report" },
        { key: "cadence", header: "Cadence" },
        { key: "format", header: "Format" },
        { key: "status", header: "Status" },
      ]}
      rows={[
        { name: "Monthly revenue summary", cadence: "Monthly", format: "PDF", status: <Badge tone="green">scheduled</Badge> },
        { name: "Tenant usage report", cadence: "Weekly", format: "CSV", status: <Badge tone="green">scheduled</Badge> },
        { name: "AI cost breakdown", cadence: "On-demand", format: "XLSX", status: <Badge tone="slate">manual</Badge> },
      ]}
      note="Report builder with scheduling and export delivery ships with the analytics module."
    />
  );
}
