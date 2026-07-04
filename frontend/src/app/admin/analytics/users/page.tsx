"use client";

import { useEffect, useState } from "react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ChartCard } from "@/components/admin/ChartCard";
import { api } from "@/lib/api";
import type { AdminOverview } from "@/lib/types";

export default function UserGrowthAnalyticsPage() {
  const [data, setData] = useState<AdminOverview | null>(null);
  useEffect(() => {
    api<AdminOverview>("/admin/overview").then(setData).catch(() => setData(null));
  }, []);
  return (
    <div className="space-y-5">
      <AdminPageHeader title="User Growth" subtitle="Cumulative platform users over time." />
      <ChartCard title="Users" subtitle="Cumulative" type="area" height={320} data={data?.charts.user_growth ?? []} series={[{ key: "value", color: "#0ea5e9" }]} />
    </div>
  );
}
