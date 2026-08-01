"use client";

import { StubModule } from "@/components/admin/StubModule";

export default function NotificationsPage() {
  return (
    <div className="p-4 lg:p-6">
      <StubModule
        title="Notification Center"
        subtitle="In-app and push notifications for your team."
        columns={[
          { key: "title", header: "Notification" },
          { key: "type", header: "Type" },
          { key: "when", header: "When", align: "right" },
        ]}
        rows={[
          { title: "New high-scoring candidate for Senior Developer", type: "AI", when: "10m ago" },
          { title: "Interview starting in 30 minutes", type: "Reminder", when: "25m ago" },
          { title: "Credit balance is running low", type: "Billing", when: "2h ago" },
        ]}
        note="Preview module. Notification preferences and delivery channels will be configurable here."
      />
    </div>
  );
}
