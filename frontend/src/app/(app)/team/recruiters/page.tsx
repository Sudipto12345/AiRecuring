"use client";

import { StubModule } from "@/components/admin/StubModule";

export default function RecruitersPage() {
  return (
    <div className="p-4 lg:p-6">
      <StubModule
        title="Recruiters"
        subtitle="Recruiter workload and performance leaderboard."
        columns={[
          { key: "name", header: "Recruiter" },
          { key: "active", header: "Active reqs", align: "right" },
          { key: "hires", header: "Hires (90d)", align: "right" },
          { key: "ttf", header: "Avg time to fill" },
        ]}
        rows={[
          { name: "Sadia Islam", active: "8", hires: "6", ttf: "21 days" },
          { name: "Rakib Ahmed", active: "5", hires: "4", ttf: "26 days" },
          { name: "Tasnim Jahan", active: "4", hires: "3", ttf: "24 days" },
        ]}
        note="Preview module. Recruiter analytics will populate from real assignment data once enabled."
      />
    </div>
  );
}
