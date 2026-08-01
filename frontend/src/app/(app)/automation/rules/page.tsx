"use client";

import { StubModule } from "@/components/admin/StubModule";

export default function AutomationRulesPage() {
  return (
    <div className="p-4 lg:p-6">
      <StubModule
        title="Automation Rules"
        subtitle="If-this-then-that rules that run as candidates move through stages."
        columns={[
          { key: "trigger", header: "When" },
          { key: "action", header: "Do" },
          { key: "status", header: "Status" },
        ]}
        rows={[
          { trigger: "AI score ≥ 85", action: "Auto-shortlist candidate", status: "Active" },
          { trigger: "AI score < 40", action: "Auto-reject with email", status: "Paused" },
          { trigger: "Shortlisted", action: "Send assessment link", status: "Active" },
        ]}
        note="Preview module. Rule execution will run server-side once the automation engine is enabled."
      />
    </div>
  );
}
