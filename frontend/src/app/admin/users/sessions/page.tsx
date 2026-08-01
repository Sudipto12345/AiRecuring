"use client";

import { Badge } from "@/components/ui/Badge";
import { StubModule } from "@/components/admin/StubModule";

export default function LoginSessionsPage() {
  return (
    <StubModule
      title="Login Sessions"
      subtitle="Active and recent authenticated sessions."
      stats={[
        { label: "Active sessions", value: 41 },
        { label: "Devices", value: 38 },
        { label: "Countries", value: 7 },
        { label: "Suspicious", value: 1 },
      ]}
      columns={[
        { key: "user", header: "User" },
        { key: "ip", header: "IP" },
        { key: "device", header: "Device" },
        { key: "location", header: "Location" },
        { key: "started", header: "Started" },
        { key: "status", header: "Status" },
      ]}
      rows={[
        { user: "admin@enterprise.com", ip: "139.180.223.10", device: "Chrome · macOS", location: "Dhaka, BD", started: "2m ago", status: <Badge tone="green">active</Badge> },
        { user: "hr@enterprise.com", ip: "103.4.12.55", device: "Safari · iOS", location: "Dhaka, BD", started: "18m ago", status: <Badge tone="green">active</Badge> },
        { user: "admin@pro.com", ip: "45.118.2.9", device: "Firefox · Windows", location: "Mumbai, IN", started: "1h ago", status: <Badge tone="green">active</Badge> },
        { user: "unknown", ip: "185.220.101.4", device: "curl", location: "Tor exit", started: "3h ago", status: <Badge tone="rose">flagged</Badge> },
      ]}
      note="Session tracking is backed by Redis once session persistence is enabled."
    />
  );
}
