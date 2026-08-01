"use client";

import { Cloud, FileText, HardDrive, Video } from "lucide-react";

import { StubModule } from "@/components/admin/StubModule";

export default function StoragePage() {
  return (
    <div className="p-4 lg:p-6">
      <StubModule
        title="Storage"
        subtitle="File and video storage used by your workspace."
        stats={[
          { label: "Used", value: "12.4 GB", icon: HardDrive, tone: "accent" },
          { label: "Resumes", value: "3.1 GB", icon: FileText, tone: "sky" },
          { label: "Videos", value: "8.6 GB", icon: Video, tone: "amber" },
          { label: "Quota", value: "50 GB", icon: Cloud, tone: "emerald" },
        ]}
        note="Preview module. Live storage metrics will be sourced from object storage (MinIO) usage."
      />
    </div>
  );
}
