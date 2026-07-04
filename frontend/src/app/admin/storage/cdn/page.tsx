"use client";

import { Badge } from "@/components/ui/Badge";
import { StubModule } from "@/components/admin/StubModule";

export default function CdnPage() {
  return (
    <StubModule
      title="CDN"
      subtitle="Content delivery and edge caching."
      stats={[
        { label: "Cache hit ratio", value: "94%" },
        { label: "Edge locations", value: 38 },
        { label: "Bandwidth (24h)", value: "1.2 TB" },
        { label: "Avg latency", value: "42ms" },
      ]}
      columns={[
        { key: "region", header: "Region" },
        { key: "requests", header: "Requests", align: "right" },
        { key: "hit", header: "Hit ratio" },
        { key: "status", header: "Status" },
      ]}
      rows={[
        { region: "Asia / SG", requests: "412k", hit: "95%", status: <Badge tone="green">healthy</Badge> },
        { region: "EU / FRA", requests: "208k", hit: "93%", status: <Badge tone="green">healthy</Badge> },
        { region: "US / IAD", requests: "301k", hit: "94%", status: <Badge tone="green">healthy</Badge> },
      ]}
      note="CDN metrics populate once a provider (CloudFront/Cloudflare) is connected."
    />
  );
}
