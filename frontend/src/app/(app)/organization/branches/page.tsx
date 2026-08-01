"use client";

import { StubModule } from "@/components/admin/StubModule";

export default function BranchesPage() {
  return (
    <div className="p-4 lg:p-6">
      <StubModule
        title="Branches"
        subtitle="Office locations and regional hiring."
        columns={[
          { key: "branch", header: "Branch" },
          { key: "location", header: "Location" },
          { key: "openings", header: "Open roles", align: "right" },
        ]}
        rows={[
          { branch: "Headquarters", location: "Dhaka, BD", openings: "6" },
          { branch: "Engineering Hub", location: "Remote", openings: "3" },
        ]}
        note="Preview module. Branches will let you scope jobs and reports by location."
      />
    </div>
  );
}
