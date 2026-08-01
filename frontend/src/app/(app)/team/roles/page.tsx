"use client";

import { StubModule } from "@/components/admin/StubModule";

export default function TeamRolesPage() {
  return (
    <div className="p-4 lg:p-6">
      <StubModule
        title="Roles"
        subtitle="Role definitions and what each role can access."
        columns={[
          { key: "role", header: "Role" },
          { key: "members", header: "Members", align: "right" },
          { key: "scope", header: "Access scope" },
        ]}
        rows={[
          { role: "Company Admin", members: "2", scope: "Full workspace" },
          { role: "HR / Recruiter", members: "6", scope: "Jobs, candidates, interviews" },
          { role: "Interviewer", members: "4", scope: "Assigned interviews only" },
        ]}
        note="Preview module. Role definitions are currently managed by the platform; granular custom roles will be editable here."
      />
    </div>
  );
}
