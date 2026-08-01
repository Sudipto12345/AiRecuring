"use client";

import { useEffect, useState } from "react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatWidget } from "@/components/admin/StatWidget";
import { HardDrive } from "lucide-react";
import { api } from "@/lib/api";
import type { AdminOverview } from "@/lib/types";

export default function StorageUsagePage() {
  const [storage, setStorage] = useState<AdminOverview["storage"] | null>(null);
  useEffect(() => {
    api<AdminOverview>("/admin/overview").then((d) => setStorage(d.storage)).catch(() => setStorage(null));
  }, []);

  const pct = storage ? Math.min(100, Math.round((storage.used_gb / storage.total_gb) * 100)) : 0;

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Storage Usage" subtitle="Aggregate object-storage consumption." />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatWidget label="Used" value={storage ? `${storage.used_gb} GB` : "—"} icon={HardDrive} tone="sky" />
        <StatWidget label="Capacity" value={storage ? `${storage.total_gb} GB` : "—"} icon={HardDrive} />
        <StatWidget label="Utilization" value={`${pct}%`} icon={HardDrive} tone={pct > 80 ? "rose" : "emerald"} />
        <StatWidget label="Headroom" value={storage ? `${(storage.total_gb - storage.used_gb).toFixed(1)} GB` : "—"} icon={HardDrive} />
      </div>
      <div className="a-card p-5">
        <p className="mb-2 text-sm font-medium a-text">Capacity</p>
        <div className="h-4 w-full overflow-hidden rounded-full a-surface-2">
          <div className="h-full rounded-full bg-[var(--admin-accent)]" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-xs a-faint">{pct}% of {storage?.total_gb ?? "—"} GB used</p>
      </div>
    </div>
  );
}
