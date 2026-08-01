"use client";

import { StubModule } from "@/components/admin/StubModule";

export default function SecurityAuditPage() {
  return (
    <div className="p-4 lg:p-6">
      <StubModule
        title="Audit Logs"
        subtitle="Security-relevant events in your workspace."
        columns={[
          { key: "actor", header: "Actor" },
          { key: "action", header: "Action" },
          { key: "ip", header: "IP" },
          { key: "when", header: "When", align: "right" },
        ]}
        rows={[
          { actor: "admin@company.com", action: "Signed in", ip: "203.0.113.4", when: "2h ago" },
          { actor: "hr@company.com", action: "Updated candidate stage", ip: "203.0.113.9", when: "5h ago" },
        ]}
        note="Preview module. Company-scoped audit logging will stream here once enabled."
      />
    </div>
  );
}
