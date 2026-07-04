"use client";

import { StubModule } from "@/components/admin/StubModule";

export default function PermissionsPage() {
  return (
    <div className="p-4 lg:p-6">
      <StubModule
        title="Permissions"
        subtitle="What each role can do in your workspace."
        columns={[
          { key: "capability", header: "Capability" },
          { key: "admin", header: "Admin", align: "center" },
          { key: "hr", header: "HR", align: "center" },
          { key: "interviewer", header: "Interviewer", align: "center" },
        ]}
        rows={[
          { capability: "Manage jobs", admin: "Yes", hr: "Yes", interviewer: "No" },
          { capability: "Manage candidates", admin: "Yes", hr: "Yes", interviewer: "No" },
          { capability: "Conduct interviews", admin: "Yes", hr: "Yes", interviewer: "Yes" },
          { capability: "Billing & team", admin: "Yes", hr: "No", interviewer: "No" },
        ]}
        note="Preview module. The permission matrix reflects current role behavior; granular custom permissions are coming."
      />
    </div>
  );
}
