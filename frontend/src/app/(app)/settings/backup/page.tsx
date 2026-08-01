"use client";

import { StubModule } from "@/components/admin/StubModule";

export default function BackupPage() {
  return (
    <div className="p-4 lg:p-6">
      <StubModule
        title="Backup"
        subtitle="Export and back up your workspace data."
        columns={[
          { key: "item", header: "Data" },
          { key: "format", header: "Export format" },
        ]}
        rows={[
          { item: "Candidates", format: "CSV / JSON" },
          { item: "Jobs", format: "CSV / JSON" },
          { item: "Interviews", format: "JSON" },
        ]}
        note="Preview module. Scheduled backups and one-click exports will be available here."
      />
    </div>
  );
}
