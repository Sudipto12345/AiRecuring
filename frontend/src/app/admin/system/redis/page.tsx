"use client";

import { useEffect, useState } from "react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatWidget } from "@/components/admin/StatWidget";
import { Badge } from "@/components/ui/Badge";
import { Database } from "lucide-react";
import { api } from "@/lib/api";

interface RedisData {
  available: boolean;
  version?: string;
  uptime_days?: number;
  connected_clients?: number;
  used_memory_human?: string;
  total_commands?: number;
  keyspace_hits?: number;
  keyspace_misses?: number;
}

export default function RedisPage() {
  const [d, setD] = useState<RedisData | null>(null);
  useEffect(() => {
    api<RedisData>("/admin/system/redis").then(setD).catch(() => setD({ available: false }));
  }, []);

  const hitRatio = d?.keyspace_hits != null && (d.keyspace_hits + (d.keyspace_misses ?? 0)) > 0
    ? `${Math.round((d.keyspace_hits / (d.keyspace_hits + (d.keyspace_misses ?? 0))) * 100)}%`
    : "—";

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Redis"
        subtitle="Cache, queue, and rate-limiting store."
        actions={d && <Badge tone={d.available ? "green" : "rose"} dot>{d.available ? "connected" : "offline"}</Badge>}
      />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatWidget label="Version" value={d?.version ?? "—"} icon={Database} />
        <StatWidget label="Memory" value={d?.used_memory_human ?? "—"} icon={Database} tone="sky" />
        <StatWidget label="Clients" value={d?.connected_clients ?? "—"} icon={Database} />
        <StatWidget label="Uptime (days)" value={d?.uptime_days ?? "—"} icon={Database} tone="emerald" />
        <StatWidget label="Commands" value={d?.total_commands?.toLocaleString() ?? "—"} icon={Database} />
        <StatWidget label="Hit ratio" value={hitRatio} icon={Database} tone="accent" />
      </div>
    </div>
  );
}
