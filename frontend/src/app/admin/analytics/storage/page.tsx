"use client";

import { StubModule } from "@/components/admin/StubModule";

export default function StorageAnalyticsPage() {
  return (
    <StubModule
      title="Storage Analytics"
      subtitle="Storage growth and breakdown by content type."
      stats={[
        { label: "Total used", value: "612 GB" },
        { label: "Resumes", value: "48 GB" },
        { label: "Videos", value: "540 GB" },
        { label: "Growth / mo", value: "+9%" },
      ]}
      columns={[
        { key: "type", header: "Content" },
        { key: "size", header: "Size", align: "right" },
        { key: "files", header: "Files", align: "right" },
        { key: "share", header: "Share" },
      ]}
      rows={[
        { type: "Interview videos", size: "540 GB", files: "1,204", share: "88%" },
        { type: "Resumes (PDF/DOCX)", size: "48 GB", files: "9,310", share: "8%" },
        { type: "Exports & logos", size: "24 GB", files: "612", share: "4%" },
      ]}
      note="Detailed storage metering is sourced from MinIO bucket statistics once metering is wired up."
    />
  );
}
