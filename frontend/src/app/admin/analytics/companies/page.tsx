"use client";

import { useEffect, useState } from "react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ChartCard } from "@/components/admin/ChartCard";
import { api } from "@/lib/api";
import type { AdminOverview } from "@/lib/types";

export default function CompaniesAnalyticsPage() {
  const [data, setData] = useState<AdminOverview | null>(null);
  useEffect(() => {
    api<AdminOverview>("/admin/overview").then(setData).catch(() => setData(null));
  }, []);
  return (
    <div className="space-y-5">
      <AdminPageHeader title="Companies" subtitle="Tenant growth and acquisition." />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Cumulative Tenants" type="area" height={300} data={data?.charts.company_growth ?? []} series={[{ key: "value", color: "#8b5cf6" }]} />
        <ChartCard title="New Companies / Month" type="bar" height={300} data={data?.charts.company_new ?? []} series={[{ key: "value", color: "#10b981" }]} />
      </div>
    </div>
  );
}
