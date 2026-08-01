"use client";

import { Badge } from "@/components/ui/Badge";
import { StubModule } from "@/components/admin/StubModule";

export default function PromptTemplatesPage() {
  return (
    <StubModule
      title="Prompt Templates"
      subtitle="Versioned system prompts used across AI operations."
      stats={[
        { label: "Templates", value: 6 },
        { label: "Versions", value: 19 },
        { label: "In production", value: 6 },
        { label: "Drafts", value: 3 },
      ]}
      columns={[
        { key: "name", header: "Template" },
        { key: "use", header: "Used for" },
        { key: "version", header: "Version" },
        { key: "status", header: "Status" },
      ]}
      rows={[
        { name: "cv_parse_v3", use: "Resume extraction", version: "v3", status: <Badge tone="green">live</Badge> },
        { name: "cv_score_v2", use: "Candidate scoring", version: "v2", status: <Badge tone="green">live</Badge> },
        { name: "interview_summary_v1", use: "Interview analysis", version: "v1", status: <Badge tone="amber">draft</Badge> },
      ]}
      note="Prompt versioning with A/B evaluation will be editable here once the prompt registry ships."
    />
  );
}
