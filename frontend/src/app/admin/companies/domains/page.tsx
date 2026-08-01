"use client";

import { Badge } from "@/components/ui/Badge";
import { StubModule } from "@/components/admin/StubModule";

export default function CompanyDomainsPage() {
  return (
    <StubModule
      title="Company Domains"
      subtitle="Verified email domains and custom white-label domains per tenant."
      stats={[
        { label: "Verified domains", value: 14 },
        { label: "Pending DNS", value: 3 },
        { label: "Custom domains", value: 5 },
        { label: "SSL active", value: 5 },
      ]}
      columns={[
        { key: "company", header: "Company" },
        { key: "domain", header: "Domain" },
        { key: "type", header: "Type" },
        { key: "status", header: "Status" },
      ]}
      rows={[
        { company: "Enterprise Corp", domain: "enterprise.com", type: "Email", status: <Badge tone="green">verified</Badge> },
        { company: "Enterprise Corp", domain: "careers.enterprise.com", type: "Custom (white-label)", status: <Badge tone="green">SSL active</Badge> },
        { company: "Pro Startup", domain: "pro.com", type: "Email", status: <Badge tone="amber">pending DNS</Badge> },
      ]}
      note="Domain verification uses DNS TXT records; custom domains auto-provision TLS via the CDN."
    />
  );
}
