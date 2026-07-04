"use client";

import { Badge } from "@/components/ui/Badge";
import { StubModule } from "@/components/admin/StubModule";

export default function EmailTemplatesPage() {
  return (
    <StubModule
      title="Email Templates"
      subtitle="Transactional and notification email templates."
      stats={[
        { label: "Templates", value: 11 },
        { label: "Active", value: 9 },
        { label: "Sent (24h)", value: 412 },
        { label: "Open rate", value: "62%" },
      ]}
      columns={[
        { key: "name", header: "Template" },
        { key: "trigger", header: "Trigger" },
        { key: "sent", header: "Sent (7d)", align: "right" },
        { key: "status", header: "Status" },
      ]}
      rows={[
        { name: "Exam invitation", trigger: "Exam dispatched", sent: 218, status: <Badge tone="green">active</Badge> },
        { name: "Interview scheduled", trigger: "Interview booked", sent: 96, status: <Badge tone="green">active</Badge> },
        { name: "Welcome", trigger: "Company created", sent: 12, status: <Badge tone="green">active</Badge> },
      ]}
      note="Template editor with variables and preview ships with the communication module."
    />
  );
}
