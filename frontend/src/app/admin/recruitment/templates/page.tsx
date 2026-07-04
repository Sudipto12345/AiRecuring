"use client";

import { Badge } from "@/components/ui/Badge";
import { StubModule } from "@/components/admin/StubModule";

export default function RecruitmentTemplatesPage() {
  return (
    <StubModule
      title="Templates"
      subtitle="Reusable job, email, and exam templates available to tenants."
      stats={[
        { label: "Job templates", value: 24 },
        { label: "Email templates", value: 11 },
        { label: "Exam templates", value: 9 },
        { label: "Shared", value: 18 },
      ]}
      columns={[
        { key: "name", header: "Template" },
        { key: "type", header: "Type" },
        { key: "owner", header: "Owner" },
        { key: "scope", header: "Scope" },
      ]}
      rows={[
        { name: "Senior Backend Engineer", type: "Job", owner: "Platform", scope: <Badge tone="blue">global</Badge> },
        { name: "Interview Invitation", type: "Email", owner: "Platform", scope: <Badge tone="blue">global</Badge> },
        { name: "Frontend MCQ Set", type: "Exam", owner: "Enterprise Corp", scope: <Badge tone="slate">tenant</Badge> },
      ]}
      note="Platform-curated template library will be editable here once template publishing is enabled."
    />
  );
}
