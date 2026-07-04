"use client";

import { Badge } from "@/components/ui/Badge";
import { StubModule } from "@/components/admin/StubModule";

export default function VideosStoragePage() {
  return (
    <StubModule
      title="Videos"
      subtitle="Interview recordings stored across tenants."
      stats={[
        { label: "Recordings", value: "1,204" },
        { label: "Total size", value: "540 GB" },
        { label: "Avg length", value: "27m" },
        { label: "Transcoding", value: 3 },
      ]}
      columns={[
        { key: "candidate", header: "Candidate" },
        { key: "company", header: "Company" },
        { key: "size", header: "Size", align: "right" },
        { key: "status", header: "Status" },
      ]}
      rows={[
        { candidate: "Aiman R.", company: "Enterprise Corp", size: "412 MB", status: <Badge tone="green">stored</Badge> },
        { candidate: "Priya S.", company: "Pro Startup", size: "388 MB", status: <Badge tone="amber">transcoding</Badge> },
        { candidate: "John D.", company: "Acme QA", size: "501 MB", status: <Badge tone="green">stored</Badge> },
      ]}
      note="Video lifecycle and retention policies are managed by MinIO + transcoding workers."
    />
  );
}
