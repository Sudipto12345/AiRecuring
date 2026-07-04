"use client";

import { useEffect, useState } from "react";
import { Bot, Coins, Cpu } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ChartCard } from "@/components/admin/ChartCard";
import { StatWidget } from "@/components/admin/StatWidget";
import { api } from "@/lib/api";

interface Usage {
  total_requests: number;
  total_credits: number;
  total_tokens: number;
  by_reason: { reason: string; count: number; credits: number }[];
  by_model: { model: string; count: number }[];
  top_companies: { company_id: string; name: string; credits: number }[];
}

export default function AiUsagePage() {
  const [data, setData] = useState<Usage | null>(null);

  useEffect(() => {
    api<Usage>("/admin/ai/usage").then(setData).catch(() => setData(null));
  }, []);

  return (
    <div className="space-y-5">
      <AdminPageHeader title="AI Usage" subtitle="Token consumption and AI credit spend across the platform." />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatWidget label="AI Requests" value={data?.total_requests ?? "—"} icon={Bot} />
        <StatWidget label="Credits Spent" value={data?.total_credits.toLocaleString() ?? "—"} icon={Coins} tone="amber" />
        <StatWidget label="Tokens" value={data?.total_tokens.toLocaleString() ?? "—"} icon={Cpu} tone="sky" />
        <StatWidget label="Models used" value={data?.by_model.length ?? "—"} icon={Bot} tone="emerald" />
      </div>

      {data && data.by_reason.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard
            title="Credits by operation"
            type="bar"
            data={data.by_reason.map((r) => ({ label: r.reason, credits: r.credits }))}
            series={[{ key: "credits", color: "#6366f1" }]}
          />
          <div className="a-card overflow-hidden">
            <div className="border-b a-border px-4 py-3">
              <h3 className="text-sm font-semibold a-text">Top companies by spend</h3>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {data.top_companies.map((c) => (
                  <tr key={c.company_id} className="border-b a-border/70 last:border-0">
                    <td className="px-4 py-2.5 a-text">{c.name}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums a-muted">{c.credits.toLocaleString()} cr</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="a-card p-8 text-center text-sm a-faint">
          No AI spend recorded yet. Usage appears here as tenants run CV parsing, scoring, and interview analysis.
        </p>
      )}
    </div>
  );
}
