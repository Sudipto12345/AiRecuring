"use client";

import { Badge } from "@/components/ui/Badge";
import { StubModule } from "@/components/admin/StubModule";

export default function QueueMonitorPage() {
  return (
    <StubModule
      title="Queue Monitor"
      subtitle="Background job queues and worker throughput."
      stats={[
        { label: "Queued", value: 9 },
        { label: "Active workers", value: 4 },
        { label: "Processed (24h)", value: "2,140" },
        { label: "Failed (24h)", value: 7 },
      ]}
      columns={[
        { key: "queue", header: "Queue" },
        { key: "pending", header: "Pending", align: "right" },
        { key: "workers", header: "Workers", align: "right" },
        { key: "status", header: "Status" },
      ]}
      rows={[
        { queue: "ai.parse", pending: 4, workers: 2, status: <Badge tone="green">healthy</Badge> },
        { queue: "ai.face", pending: 3, workers: 1, status: <Badge tone="amber">backlog</Badge> },
        { queue: "email.dispatch", pending: 2, workers: 1, status: <Badge tone="green">healthy</Badge> },
      ]}
      note="Live queue depth is provided by Redis/Celery once background workers are deployed."
    />
  );
}
