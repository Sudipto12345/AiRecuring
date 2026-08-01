"use client";

import { Badge } from "@/components/ui/Badge";
import { StubModule } from "@/components/admin/StubModule";

export default function LoginHistoryPage() {
  return (
    <StubModule
      title="Login History"
      subtitle="Authentication events across the platform."
      stats={[
        { label: "Logins (24h)", value: 214 },
        { label: "Failed", value: 18 },
        { label: "New devices", value: 6 },
        { label: "MFA challenges", value: 41 },
      ]}
      columns={[
        { key: "user", header: "User" },
        { key: "ip", header: "IP" },
        { key: "location", header: "Location" },
        { key: "time", header: "Time" },
        { key: "result", header: "Result" },
      ]}
      rows={[
        { user: "admin@enterprise.com", ip: "139.180.223.10", location: "Dhaka, BD", time: "2m ago", result: <Badge tone="green">success</Badge> },
        { user: "hr@enterprise.com", ip: "103.4.12.55", location: "Dhaka, BD", time: "18m ago", result: <Badge tone="green">success</Badge> },
        { user: "unknown@x.com", ip: "185.220.101.4", location: "Tor exit", time: "1h ago", result: <Badge tone="rose">failed</Badge> },
      ]}
      note="Authentication event capture integrates with the auth service once event streaming is enabled."
    />
  );
}
