"use client";

import { Badge } from "@/components/ui/Badge";
import { StubModule } from "@/components/admin/StubModule";

export default function SmsPage() {
  return (
    <StubModule
      title="SMS"
      subtitle="SMS notifications and OTP delivery."
      stats={[
        { label: "Sent (24h)", value: 84 },
        { label: "Delivered", value: "98%" },
        { label: "OTPs", value: 51 },
        { label: "Cost (MTD)", value: "$12" },
      ]}
      columns={[
        { key: "type", header: "Type" },
        { key: "provider", header: "Provider" },
        { key: "sent", header: "Sent (7d)", align: "right" },
        { key: "status", header: "Status" },
      ]}
      rows={[
        { type: "OTP", provider: "Twilio", sent: 312, status: <Badge tone="slate">not configured</Badge> },
        { type: "Interview reminder", provider: "Twilio", sent: 0, status: <Badge tone="slate">not configured</Badge> },
      ]}
      note="SMS delivery activates once a provider (Twilio/Vonage) is connected."
    />
  );
}
