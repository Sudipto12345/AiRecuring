"use client";

import { StubModule } from "@/components/admin/StubModule";

export default function SessionsPage() {
  return (
    <div className="p-4 lg:p-6">
      <StubModule
        title="Login Sessions"
        subtitle="Devices currently signed in to your workspace."
        columns={[
          { key: "device", header: "Device" },
          { key: "location", header: "Location" },
          { key: "last", header: "Last active", align: "right" },
        ]}
        rows={[
          { device: "Chrome · Linux", location: "Dhaka, BD", last: "Now" },
          { device: "Safari · iPhone", location: "Dhaka, BD", last: "1d ago" },
        ]}
        note="Preview module. Revoke sessions and review device history once session management is enabled."
      />
    </div>
  );
}
