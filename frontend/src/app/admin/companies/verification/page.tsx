"use client";

import { Badge } from "@/components/ui/Badge";
import { StubModule } from "@/components/admin/StubModule";

export default function CompanyVerificationPage() {
  return (
    <StubModule
      title="Company Verification"
      subtitle="Know-Your-Business (KYB) checks and document review."
      stats={[
        { label: "Awaiting review", value: 4 },
        { label: "Verified", value: 9 },
        { label: "Rejected", value: 1 },
        { label: "Expiring soon", value: 2 },
      ]}
      columns={[
        { key: "company", header: "Company" },
        { key: "document", header: "Document" },
        { key: "country", header: "Country" },
        { key: "submitted", header: "Submitted" },
        { key: "status", header: "Status" },
      ]}
      rows={[
        { company: "Enterprise Corp", document: "Certificate of Incorporation", country: "US", submitted: "2d ago", status: <Badge tone="green">verified</Badge> },
        { company: "Northwind Labs", document: "Tax ID", country: "UK", submitted: "5h ago", status: <Badge tone="amber">review</Badge> },
        { company: "Beacon Health", document: "Business License", country: "CA", submitted: "1d ago", status: <Badge tone="amber">review</Badge> },
      ]}
      note="Document verification integrates with a KYB provider (Persona/Middesk) when enabled."
    />
  );
}
