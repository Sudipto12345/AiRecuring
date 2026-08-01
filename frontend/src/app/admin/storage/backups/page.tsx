"use client";

import { Badge } from "@/components/ui/Badge";
import { StubModule } from "@/components/admin/StubModule";

export default function BackupsPage() {
  return (
    <StubModule
      title="Backups"
      subtitle="Database and object-storage backup schedule."
      stats={[
        { label: "Last backup", value: "2h ago" },
        { label: "Retention", value: "30d" },
        { label: "Backup size", value: "18 GB" },
        { label: "Restores (90d)", value: 0 },
      ]}
      columns={[
        { key: "snapshot", header: "Snapshot" },
        { key: "scope", header: "Scope" },
        { key: "size", header: "Size", align: "right" },
        { key: "status", header: "Status" },
      ]}
      rows={[
        { snapshot: "2026-06-29 22:00", scope: "MongoDB", size: "12 GB", status: <Badge tone="green">complete</Badge> },
        { snapshot: "2026-06-29 22:00", scope: "MinIO", size: "6 GB", status: <Badge tone="green">complete</Badge> },
        { snapshot: "2026-06-28 22:00", scope: "MongoDB", size: "12 GB", status: <Badge tone="green">complete</Badge> },
      ]}
      note="Backup orchestration and point-in-time restore connect to your backup tooling when enabled."
    />
  );
}
