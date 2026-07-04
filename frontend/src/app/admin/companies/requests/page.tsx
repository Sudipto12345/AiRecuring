"use client";

import { Badge } from "@/components/ui/Badge";
import { StubModule } from "@/components/admin/StubModule";

export default function CompanyRequestsPage() {
  return (
    <StubModule
      title="Company Requests"
      subtitle="Pending tenant sign-up and upgrade requests awaiting approval."
      stats={[
        { label: "Pending", value: 5 },
        { label: "Approved (7d)", value: 12 },
        { label: "Rejected (7d)", value: 2 },
        { label: "Avg review", value: "3h" },
      ]}
      columns={[
        { key: "company", header: "Company" },
        { key: "contact", header: "Contact" },
        { key: "plan", header: "Requested plan" },
        { key: "submitted", header: "Submitted" },
        { key: "status", header: "Status" },
      ]}
      rows={[
        { company: "Northwind Labs", contact: "cto@northwind.io", plan: "Business", submitted: "1h ago", status: <Badge tone="amber">pending</Badge> },
        { company: "Beacon Health", contact: "ops@beacon.com", plan: "Professional", submitted: "4h ago", status: <Badge tone="amber">pending</Badge> },
        { company: "Vertex AI", contact: "hr@vertex.ai", plan: "Enterprise", submitted: "1d ago", status: <Badge tone="amber">pending</Badge> },
      ]}
      note="Approval workflow creates the tenant and welcome email once the request pipeline is connected."
    />
  );
}
