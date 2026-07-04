"use client";

import { Inbox, Mail, MailCheck, Send } from "lucide-react";

import { StubModule } from "@/components/admin/StubModule";

export default function EmailCenterPage() {
  return (
    <div className="p-4 lg:p-6">
      <StubModule
        title="Email Center"
        subtitle="Unified candidate email inbox, templates and campaigns."
        stats={[
          { label: "Sent (30d)", value: 1240, icon: Send, tone: "accent" },
          { label: "Open rate", value: "62%", icon: MailCheck, tone: "emerald" },
          { label: "Replies", value: 318, icon: Inbox, tone: "amber" },
          { label: "Templates", value: 14, icon: Mail, tone: "sky" },
        ]}
        columns={[
          { key: "subject", header: "Subject" },
          { key: "to", header: "Candidate" },
          { key: "status", header: "Status" },
          { key: "when", header: "When", align: "right" },
        ]}
        rows={[
          { subject: "Interview invitation", to: "Md. Rafiq Hasan", status: "Opened", when: "1h ago" },
          { subject: "Application received", to: "Sadia Islam", status: "Delivered", when: "3h ago" },
          { subject: "Assessment link", to: "Rakib Ahmed", status: "Replied", when: "Yesterday" },
        ]}
        note="Preview module. The email center will connect to your mailbox (Gmail/Outlook) for two-way candidate conversations."
      />
    </div>
  );
}
