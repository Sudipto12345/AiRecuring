"use client";

import { Badge } from "@/components/ui/Badge";
import { StubModule } from "@/components/admin/StubModule";

export default function ApiLogsPage() {
  return (
    <StubModule
      title="API Logs"
      subtitle="Recent API requests and response codes."
      stats={[
        { label: "Requests (24h)", value: "18,420" },
        { label: "Errors", value: 73 },
        { label: "Avg latency", value: "142ms" },
        { label: "p99 latency", value: "640ms" },
      ]}
      columns={[
        { key: "method", header: "Method" },
        { key: "path", header: "Path" },
        { key: "code", header: "Code" },
        { key: "ms", header: "ms", align: "right" },
      ]}
      rows={[
        { method: "POST", path: "/api/candidates/upload", code: <Badge tone="green">201</Badge>, ms: 312 },
        { method: "GET", path: "/api/admin/overview", code: <Badge tone="green">200</Badge>, ms: 88 },
        { method: "POST", path: "/api/exam/submit", code: <Badge tone="amber">429</Badge>, ms: 12 },
      ]}
      note="Structured request logging streams here once API observability (OpenTelemetry) is connected."
    />
  );
}
