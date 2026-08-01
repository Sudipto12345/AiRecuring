"use client";

import { useEffect, useState } from "react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ChartCard } from "@/components/admin/ChartCard";
import { api } from "@/lib/api";
import type { AdminOverview } from "@/lib/types";

export default function AiUsageAnalyticsPage() {
  const [data, setData] = useState<AdminOverview | null>(null);
  useEffect(() => {
    api<AdminOverview>("/admin/overview").then(setData).catch(() => setData(null));
  }, []);
  return (
    <div className="space-y-5">
      <AdminPageHeader title="AI Usage" subtitle="AI requests and credit consumption per month." />
      <ChartCard title="AI Requests" subtitle="Per month" type="bar" height={320} data={data?.charts.ai_usage ?? []} series={[{ key: "requests", color: "#6366f1" }, { key: "credits", color: "#a855f7" }]} />
    </div>
  );
}
