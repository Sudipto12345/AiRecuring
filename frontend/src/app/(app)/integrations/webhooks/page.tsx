"use client";

import { StubModule } from "@/components/admin/StubModule";

export default function WebhooksPage() {
  return (
    <div className="p-4 lg:p-6">
      <StubModule
        title="Webhooks"
        subtitle="Receive real-time events for candidates, interviews and hires."
        columns={[
          { key: "event", header: "Event" },
          { key: "url", header: "Endpoint" },
          { key: "status", header: "Status" },
        ]}
        rows={[
          { event: "candidate.created", url: "—", status: "Inactive" },
          { event: "interview.completed", url: "—", status: "Inactive" },
        ]}
        note="Preview module. Add webhook endpoints to stream events into your downstream systems."
      />
    </div>
  );
}
