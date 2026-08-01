"use client";

import { useEffect, useState } from "react";
import { Database } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatWidget } from "@/components/admin/StatWidget";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";

interface VectorData {
  available: boolean;
  url: string;
  dim: number;
  collections: { name: string; points: number; vectors: number }[];
}

export default function VectorDbPage() {
  const [data, setData] = useState<VectorData | null>(null);

  useEffect(() => {
    api<VectorData>("/admin/ai/vector").then(setData).catch(() => setData(null));
  }, []);

  const totalPoints = data?.collections.reduce((a, c) => a + c.points, 0) ?? 0;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Vector Database"
        subtitle="Qdrant semantic-search index for candidates and jobs."
        actions={data && <Badge tone={data.available ? "green" : "rose"} dot>{data.available ? "connected" : "offline"}</Badge>}
      />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatWidget label="Collections" value={data?.collections.length ?? "—"} icon={Database} />
        <StatWidget label="Total vectors" value={totalPoints.toLocaleString()} icon={Database} tone="sky" />
        <StatWidget label="Dimensions" value={data?.dim ?? "—"} icon={Database} tone="accent" />
        <StatWidget label="Endpoint" value={data?.available ? "online" : "offline"} icon={Database} tone={data?.available ? "emerald" : "rose"} />
      </div>

      <div className="a-card overflow-hidden">
        <div className="border-b a-border px-4 py-3">
          <h3 className="text-sm font-semibold a-text">Collections · {data?.url}</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b a-border text-left text-xs uppercase tracking-wide a-faint">
              <th className="px-4 py-2.5 font-medium">Collection</th>
              <th className="px-4 py-2.5 text-right font-medium">Points</th>
            </tr>
          </thead>
          <tbody>
            {data?.collections.length ? (
              data.collections.map((c) => (
                <tr key={c.name} className="border-b a-border/70 last:border-0">
                  <td className="px-4 py-2.5 a-text">{c.name}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums a-muted">{c.points.toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center a-faint">
                  {data?.available ? "No collections indexed yet." : "Qdrant is not reachable."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
