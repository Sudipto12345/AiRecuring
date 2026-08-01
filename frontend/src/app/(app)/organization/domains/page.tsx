"use client";

import { StubModule } from "@/components/admin/StubModule";

export default function DomainsPage() {
  return (
    <div className="p-4 lg:p-6">
      <StubModule
        title="Domains"
        subtitle="Custom domains for your careers page and emails."
        columns={[
          { key: "domain", header: "Domain" },
          { key: "purpose", header: "Purpose" },
          { key: "status", header: "Status" },
        ]}
        rows={[{ domain: "careers.yourcompany.com", purpose: "Career portal", status: "Not configured" }]}
        note="Preview module. Verify a custom domain to host your careers page under your own brand."
      />
    </div>
  );
}
