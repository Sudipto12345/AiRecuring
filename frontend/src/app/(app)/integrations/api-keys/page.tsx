"use client";

import { StubModule } from "@/components/admin/StubModule";

export default function ApiKeysPage() {
  return (
    <div className="p-4 lg:p-6">
      <StubModule
        title="API Keys"
        subtitle="Programmatic access to your workspace data."
        columns={[
          { key: "name", header: "Key" },
          { key: "scope", header: "Scope" },
          { key: "created", header: "Created", align: "right" },
        ]}
        rows={[{ name: "No keys yet", scope: "—", created: "—" }]}
        note="Preview module. Generate scoped API keys to integrate AIRecruit with your own systems."
      />
    </div>
  );
}
