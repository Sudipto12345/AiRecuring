"use client";

import { StubModule } from "@/components/admin/StubModule";

export default function CalendarIntegrationPage() {
  return (
    <div className="p-4 lg:p-6">
      <StubModule
        title="Calendar"
        subtitle="Sync interviews with Google Calendar and Outlook."
        columns={[
          { key: "provider", header: "Provider" },
          { key: "account", header: "Account" },
          { key: "status", header: "Status" },
        ]}
        rows={[
          { provider: "Google Calendar", account: "Not connected", status: "Disconnected" },
          { provider: "Outlook Calendar", account: "Not connected", status: "Disconnected" },
        ]}
        note="Preview module. Connect a calendar to auto-create interview events and avoid scheduling conflicts."
      />
    </div>
  );
}
