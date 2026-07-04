"use client";

import { Badge } from "@/components/ui/Badge";
import { StubModule } from "@/components/admin/StubModule";

export default function SupportStaffPage() {
  return (
    <StubModule
      title="Support Staff"
      subtitle="Internal support agents and their assignments."
      stats={[
        { label: "Agents", value: 6 },
        { label: "Online", value: 4 },
        { label: "Open tickets", value: 23 },
        { label: "Avg response", value: "14m" },
      ]}
      columns={[
        { key: "name", header: "Agent" },
        { key: "email", header: "Email" },
        { key: "tier", header: "Tier" },
        { key: "tickets", header: "Open", align: "right" },
        { key: "status", header: "Status" },
      ]}
      rows={[
        { name: "Dana White", email: "dana@airecruit.io", tier: "L2", tickets: 5, status: <Badge tone="green">online</Badge> },
        { name: "Omar Faruk", email: "omar@airecruit.io", tier: "L1", tickets: 8, status: <Badge tone="green">online</Badge> },
        { name: "Lena Park", email: "lena@airecruit.io", tier: "L3", tickets: 2, status: <Badge tone="slate">away</Badge> },
        { name: "Ravi Shah", email: "ravi@airecruit.io", tier: "L2", tickets: 8, status: <Badge tone="green">online</Badge> },
      ]}
      note="Support staff management connects to your help-desk provider (Zendesk/Intercom) once integrated."
    />
  );
}
