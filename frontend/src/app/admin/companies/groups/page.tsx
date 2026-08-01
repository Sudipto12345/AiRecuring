"use client";

import { StubModule } from "@/components/admin/StubModule";

export default function CompanyGroupsPage() {
  return (
    <StubModule
      title="Company Groups"
      subtitle="Parent organizations grouping multiple tenant workspaces."
      stats={[
        { label: "Groups", value: 3 },
        { label: "Grouped tenants", value: 8 },
        { label: "Consolidated seats", value: 240 },
        { label: "Shared billing", value: 2 },
      ]}
      columns={[
        { key: "group", header: "Group" },
        { key: "tenants", header: "Tenants", align: "right" },
        { key: "seats", header: "Seats", align: "right" },
        { key: "billing", header: "Billing" },
      ]}
      rows={[
        { group: "Acme Holdings", tenants: 4, seats: 120, billing: "Consolidated" },
        { group: "Globex Group", tenants: 2, seats: 70, billing: "Per-tenant" },
        { group: "Initech Partners", tenants: 2, seats: 50, billing: "Consolidated" },
      ]}
      note="Company groups enable shared billing and cross-tenant reporting for enterprise holdings."
    />
  );
}
