"use client";

import { StubModule } from "@/components/admin/StubModule";

export default function SmsPage() {
  return (
    <div className="p-4 lg:p-6">
      <StubModule
        title="SMS"
        subtitle="Send interview reminders and updates over SMS."
        columns={[
          { key: "to", header: "Recipient" },
          { key: "message", header: "Message" },
          { key: "status", header: "Status" },
        ]}
        rows={[
          { to: "+8801XXXXXXXXX", message: "Reminder: interview tomorrow at 10:00", status: "Delivered" },
          { to: "+8801XXXXXXXXX", message: "Your assessment link is ready", status: "Sent" },
        ]}
        note="Preview module. Connect an SMS provider (Twilio, etc.) in Integrations to enable delivery."
      />
    </div>
  );
}
