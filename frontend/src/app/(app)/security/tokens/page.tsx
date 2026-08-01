"use client";

import { StubModule } from "@/components/admin/StubModule";

export default function TokensPage() {
  return (
    <div className="p-4 lg:p-6">
      <StubModule
        title="API Tokens"
        subtitle="Personal and service access tokens."
        columns={[
          { key: "name", header: "Token" },
          { key: "scope", header: "Scope" },
          { key: "expires", header: "Expires", align: "right" },
        ]}
        rows={[{ name: "No tokens yet", scope: "—", expires: "—" }]}
        note="Preview module. Issue and revoke access tokens for integrations here."
      />
    </div>
  );
}
