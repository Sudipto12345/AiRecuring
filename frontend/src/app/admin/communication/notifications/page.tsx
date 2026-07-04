"use client";

import { Badge } from "@/components/ui/Badge";
import { StubModule } from "@/components/admin/StubModule";

export default function NotificationsPage() {
  return (
    <StubModule
      title="Notifications"
      subtitle="In-app and push notification settings."
      stats={[
        { label: "Channels", value: 4 },
        { label: "Sent (24h)", value: 1280 },
        { label: "Push enabled", value: "72%" },
        { label: "Muted", value: 14 },
      ]}
      columns={[
        { key: "channel", header: "Channel" },
        { key: "events", header: "Events" },
        { key: "delivery", header: "Delivery" },
        { key: "status", header: "Status" },
      ]}
      rows={[
        { channel: "In-app", events: "All", delivery: "Realtime", status: <Badge tone="green">active</Badge> },
        { channel: "Web push", events: "Critical only", delivery: "FCM", status: <Badge tone="amber">partial</Badge> },
        { channel: "Slack", events: "Admin alerts", delivery: "Webhook", status: <Badge tone="slate">off</Badge> },
      ]}
      note="Notification routing and per-event preferences are configurable once the notification service is wired."
    />
  );
}
