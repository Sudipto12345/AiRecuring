"use client";

import { Badge } from "@/components/ui/Badge";
import { StubModule } from "@/components/admin/StubModule";

export default function AiQueuePage() {
  return (
    <StubModule
      title="AI Queue"
      subtitle="Background AI job processing and worker throughput."
      stats={[
        { label: "Queued", value: 7 },
        { label: "Processing", value: 2 },
        { label: "Completed (24h)", value: 318 },
        { label: "Failed (24h)", value: 4 },
      ]}
      columns={[
        { key: "job", header: "Job" },
        { key: "type", header: "Type" },
        { key: "company", header: "Company" },
        { key: "status", header: "Status" },
      ]}
      rows={[
        { job: "job_a91f", type: "Bulk CV parse", company: "Enterprise Corp", status: <Badge tone="amber">processing</Badge> },
        { job: "job_b22c", type: "Interview face analysis", company: "Pro Startup", status: <Badge tone="slate">queued</Badge> },
        { job: "job_c07d", type: "Candidate embedding", company: "Acme QA", status: <Badge tone="green">done</Badge> },
      ]}
      note="Live queue depth comes from Redis/Celery once background workers are deployed."
    />
  );
}
