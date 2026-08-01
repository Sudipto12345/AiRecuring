"use client";

import { Badge } from "@/components/ui/Badge";
import { StubModule } from "@/components/admin/StubModule";

export default function WebhooksPage() {
  return (
    <StubModule
      title="Webhooks"
      subtitle="Outbound event subscriptions."
      stats={[
        { label: "Endpoints", value: 5 },
        { label: "Events (24h)", value: 1024 },
        { label: "Failures", value: 6 },
        { label: "Success rate", value: "99.4%" },
      ]}
      columns={[
        { key: "url", header: "Endpoint" },
        { key: "events", header: "Events" },
        { key: "delivered", header: "Delivered", align: "right" },
        { key: "status", header: "Status" },
      ]}
      rows={[
        { url: "https://hooks.acme.com/air", events: "candidate.*", delivered: "612", status: <Badge tone="green">active</Badge> },
        { url: "https://api.globex.io/wh", events: "interview.completed", delivered: "204", status: <Badge tone="green">active</Badge> },
        { url: "https://n8n.beacon.com/x", events: "*", delivered: "208", status: <Badge tone="amber">retrying</Badge> },
      ]}
      note="Webhook delivery with retries and signatures ships with the integrations module."
    />
  );
}
