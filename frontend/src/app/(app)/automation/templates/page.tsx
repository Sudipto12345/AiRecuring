"use client";

import { StubModule } from "@/components/admin/StubModule";

export default function AutomationTemplatesPage() {
  return (
    <div className="p-4 lg:p-6">
      <StubModule
        title="Templates"
        subtitle="Reusable job, email and message templates."
        columns={[
          { key: "name", header: "Template" },
          { key: "type", header: "Type" },
          { key: "used", header: "Used", align: "right" },
        ]}
        rows={[
          { name: "Software Engineer JD", type: "Job", used: "42" },
          { name: "Interview invitation", type: "Email", used: "118" },
          { name: "Rejection (polite)", type: "Email", used: "76" },
        ]}
        note="Preview module. Templates created here will be selectable across jobs and communication."
      />
    </div>
  );
}
