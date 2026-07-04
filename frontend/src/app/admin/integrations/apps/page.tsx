"use client";

import { Badge } from "@/components/ui/Badge";
import { StubModule } from "@/components/admin/StubModule";

export default function ThirdPartyAppsPage() {
  return (
    <StubModule
      title="Third Party Apps"
      subtitle="Connected applications and the integration marketplace."
      stats={[
        { label: "Available", value: 12 },
        { label: "Connected", value: 4 },
        { label: "Tenants using", value: 9 },
        { label: "Categories", value: 5 },
      ]}
      columns={[
        { key: "app", header: "App" },
        { key: "category", header: "Category" },
        { key: "tenants", header: "Tenants", align: "right" },
        { key: "status", header: "Status" },
      ]}
      rows={[
        { app: "Slack", category: "Messaging", tenants: 6, status: <Badge tone="green">connected</Badge> },
        { app: "Zoom", category: "Video", tenants: 4, status: <Badge tone="green">connected</Badge> },
        { app: "Google Meet", category: "Video", tenants: 3, status: <Badge tone="green">connected</Badge> },
        { app: "Microsoft Teams", category: "Video", tenants: 0, status: <Badge tone="slate">available</Badge> },
      ]}
      note="App marketplace and per-tenant connections activate with the integrations platform."
    />
  );
}
