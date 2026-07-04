"use client";

import { Badge } from "@/components/ui/Badge";
import { StubModule } from "@/components/admin/StubModule";

export default function OAuthPage() {
  return (
    <StubModule
      title="OAuth"
      subtitle="Single sign-on and OAuth application clients."
      stats={[
        { label: "Providers", value: 4 },
        { label: "SSO tenants", value: 6 },
        { label: "OAuth clients", value: 3 },
        { label: "Logins (24h)", value: 142 },
      ]}
      columns={[
        { key: "provider", header: "Provider" },
        { key: "type", header: "Type" },
        { key: "tenants", header: "Tenants", align: "right" },
        { key: "status", header: "Status" },
      ]}
      rows={[
        { provider: "Google Workspace", type: "OIDC", tenants: 4, status: <Badge tone="slate">not configured</Badge> },
        { provider: "Microsoft Entra", type: "SAML", tenants: 2, status: <Badge tone="slate">not configured</Badge> },
        { provider: "Okta", type: "SAML", tenants: 0, status: <Badge tone="slate">available</Badge> },
      ]}
      note="SSO configuration (OIDC/SAML) per tenant is enabled with the enterprise identity module."
    />
  );
}
