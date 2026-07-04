"use client";

import { StubModule } from "@/components/admin/StubModule";

export default function SettingsStoragePage() {
  return (
    <div className="p-4 lg:p-6">
      <StubModule
        title="File Storage"
        subtitle="Where resumes, videos and exports are stored."
        columns={[
          { key: "type", header: "Content" },
          { key: "backend", header: "Backend" },
          { key: "status", header: "Status" },
        ]}
        rows={[
          { type: "Resumes / documents", backend: "Object storage (MinIO)", status: "Active" },
          { type: "Interview videos", backend: "Object storage (MinIO)", status: "Active" },
          { type: "Exports", backend: "Local filesystem", status: "Active" },
        ]}
        note="Preview module. Per-workspace storage settings and retention policies are coming."
      />
    </div>
  );
}
