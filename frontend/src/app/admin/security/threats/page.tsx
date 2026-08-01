"use client";

import { Badge } from "@/components/ui/Badge";
import { StubModule } from "@/components/admin/StubModule";

export default function ThreatDetectionPage() {
  return (
    <StubModule
      title="Threat Detection"
      subtitle="Suspicious activity and blocked IPs."
      stats={[
        { label: "Blocked IPs", value: 12 },
        { label: "Rate-limit hits", value: 318 },
        { label: "Bot attempts", value: 47 },
        { label: "Active alerts", value: 1 },
      ]}
      columns={[
        { key: "ip", header: "IP" },
        { key: "reason", header: "Reason" },
        { key: "hits", header: "Hits", align: "right" },
        { key: "status", header: "Status" },
      ]}
      rows={[
        { ip: "185.220.101.4", reason: "Credential stuffing", hits: 92, status: <Badge tone="rose">blocked</Badge> },
        { ip: "45.155.205.x", reason: "Rate-limit abuse", hits: 210, status: <Badge tone="amber">throttled</Badge> },
        { ip: "103.21.244.x", reason: "Bot signature", hits: 16, status: <Badge tone="slate">watching</Badge> },
      ]}
      note="Threat intelligence and auto-blocking integrate with a WAF/Cloudflare once configured."
    />
  );
}
