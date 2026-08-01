"use client";

import { useEffect, useState } from "react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatWidget } from "@/components/admin/StatWidget";
import { Badge } from "@/components/ui/Badge";
import { Database } from "lucide-react";
import { api } from "@/lib/api";

interface MongoData {
  available: boolean;
  db?: string;
  collections?: number;
  objects?: number;
  data_size?: number;
  storage_size?: number;
  indexes?: number;
  collection_names?: string[];
}

const mb = (n?: number) => (n == null ? "—" : `${(n / 1024 / 1024).toFixed(1)} MB`);

export default function MongoPage() {
  const [d, setD] = useState<MongoData | null>(null);
  useEffect(() => {
    api<MongoData>("/admin/system/mongodb").then(setD).catch(() => setD({ available: false }));
  }, []);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="MongoDB"
        subtitle="Primary application database."
        actions={d && <Badge tone={d.available ? "green" : "rose"} dot>{d.available ? "connected" : "offline"}</Badge>}
      />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatWidget label="Database" value={d?.db ?? "—"} icon={Database} />
        <StatWidget label="Collections" value={d?.collections ?? "—"} icon={Database} tone="sky" />
        <StatWidget label="Documents" value={d?.objects?.toLocaleString() ?? "—"} icon={Database} tone="emerald" />
        <StatWidget label="Indexes" value={d?.indexes ?? "—"} icon={Database} />
        <StatWidget label="Data size" value={mb(d?.data_size)} icon={Database} tone="accent" />
        <StatWidget label="Storage size" value={mb(d?.storage_size)} icon={Database} tone="accent" />
      </div>

      {d?.collection_names && (
        <div className="a-card p-5">
          <p className="mb-3 text-sm font-semibold a-text">Collections</p>
          <div className="flex flex-wrap gap-1.5">
            {d.collection_names.map((c) => (
              <span key={c} className="rounded-md a-surface-2 px-2 py-0.5 text-xs a-muted">{c}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
