"use client";

import { useEffect, useState } from "react";
import { HardDrive } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PreviewChip } from "@/components/admin/PreviewChip";
import { StatWidget } from "@/components/admin/StatWidget";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import type { AdminOverview } from "@/lib/types";

interface ServicesData {
  services: { key: string; label: string; ok: boolean; kind: string; real: boolean }[];
}

export default function FileStoragePage() {
  const [minioOk, setMinioOk] = useState<boolean | null>(null);
  const [storage, setStorage] = useState<AdminOverview["storage"] | null>(null);

  useEffect(() => {
    api<ServicesData>("/admin/system/services")
      .then((d) => setMinioOk(d.services.find((s) => s.key === "minio")?.ok ?? false))
      .catch(() => setMinioOk(false));
    api<AdminOverview>("/admin/overview").then((d) => setStorage(d.storage)).catch(() => setStorage(null));
  }, []);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="File Storage"
        subtitle="MinIO object storage for resumes, videos, and exports."
        actions={minioOk != null && <Badge tone={minioOk ? "green" : "rose"} dot>{minioOk ? "MinIO online" : "MinIO offline"}</Badge>}
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatWidget label="Used" value={storage ? `${storage.used_gb} GB` : "—"} icon={HardDrive} tone="sky" />
        <StatWidget label="Capacity" value={storage ? `${storage.total_gb} GB` : "—"} icon={HardDrive} />
        <StatWidget label="Object store" value={minioOk ? "online" : "offline"} icon={HardDrive} tone={minioOk ? "emerald" : "rose"} />
        <StatWidget label="Buckets" value={1} icon={HardDrive} />
      </div>

      <div className="a-card overflow-hidden">
        <div className="flex items-center gap-2 border-b a-border px-4 py-3">
          <h3 className="text-sm font-semibold a-text">File breakdown by type</h3>
          <PreviewChip />
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b a-border text-left text-xs uppercase tracking-wide a-faint">
              <th className="px-4 py-2.5 font-medium">Type</th>
              <th className="px-4 py-2.5 text-right font-medium">Files</th>
              <th className="px-4 py-2.5 text-right font-medium">Size</th>
            </tr>
          </thead>
          <tbody>
            {[
              { t: "Interview videos", f: "1,204", s: "540 GB" },
              { t: "Resumes (PDF/DOCX)", f: "9,310", s: "48 GB" },
              { t: "Company logos", f: "112", s: "0.4 GB" },
              { t: "Exported reports", f: "500", s: "24 GB" },
            ].map((r) => (
              <tr key={r.t} className="border-b a-border/70 last:border-0">
                <td className="px-4 py-2.5 a-text">{r.t}</td>
                <td className="px-4 py-2.5 text-right tabular-nums a-muted">{r.f}</td>
                <td className="px-4 py-2.5 text-right tabular-nums a-muted">{r.s}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
