"use client";

import { StubModule } from "@/components/admin/StubModule";

export default function TeamActivityPage() {
  return (
    <div className="p-4 lg:p-6">
      <StubModule
        title="Activity"
        subtitle="Recent actions across your team."
        columns={[
          { key: "who", header: "Member" },
          { key: "action", header: "Action" },
          { key: "when", header: "When", align: "right" },
        ]}
        rows={[
          { who: "Sadia Islam", action: "Shortlisted 3 candidates for Senior Developer", when: "2h ago" },
          { who: "Rakib Ahmed", action: "Scheduled interview with Md. Rafiq Hasan", when: "5h ago" },
          { who: "Tasnim Jahan", action: "Created job: Product Manager", when: "Yesterday" },
        ]}
        note="Preview module. A full team activity feed will stream from the audit log once company-scoped audit is enabled."
      />
    </div>
  );
}
