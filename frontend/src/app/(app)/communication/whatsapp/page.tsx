"use client";

import { StubModule } from "@/components/admin/StubModule";

export default function WhatsappPage() {
  return (
    <div className="p-4 lg:p-6">
      <StubModule
        title="WhatsApp"
        subtitle="Reach candidates on WhatsApp with templated messages."
        columns={[
          { key: "to", header: "Candidate" },
          { key: "template", header: "Template" },
          { key: "status", header: "Status" },
        ]}
        rows={[
          { to: "Sadia Islam", template: "interview_invite", status: "Read" },
          { to: "Rakib Ahmed", template: "offer_followup", status: "Delivered" },
        ]}
        note="Preview module. Requires a WhatsApp Business API connection in Integrations."
      />
    </div>
  );
}
