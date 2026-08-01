"use client";

import { useEffect, useState } from "react";
import { HardDrive, Cloud, FileText, Video, RefreshCw } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatWidget } from "@/components/admin/StatWidget";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";

export default function AWSStoragePage() {
  const [stats, setStats] = useState({
    bucket: "airecruit-storage",
    region: "us-east-1",
    used_gb: 12.4,
    total_gb: 500,
    files_count: 1420,
    videos_count: 84,
  });

  const pct = Math.min(100, Math.round((stats.used_gb / stats.total_gb) * 100));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="AWS S3 Storage & Media Management"
        subtitle="Manage cloud document uploads, candidate CV files, proctoring video streams, and AWS S3 bucket metrics."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatWidget label="AWS S3 Bucket" value={stats.bucket} icon={Cloud} tone="sky" />
        <StatWidget label="AWS Region" value={stats.region} icon={Cloud} />
        <StatWidget label="CV Documents" value={stats.files_count.toLocaleString()} icon={FileText} tone="emerald" />
        <StatWidget label="Proctoring Videos" value={stats.videos_count.toLocaleString()} icon={Video} tone="sky" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">AWS S3 Capacity Utilization</h3>
            <p className="text-xs text-slate-500">{stats.used_gb} GB used out of {stats.total_gb} GB total headroom</p>
          </div>
          <Badge tone="green">AWS Active</Badge>
        </div>

        <div className="mt-4 h-4 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-indigo-600 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-right text-xs font-semibold text-slate-700">{pct}% capacity consumed</p>
      </div>
    </div>
  );
}
