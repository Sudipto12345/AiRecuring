"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ChartCard } from "@/components/admin/ChartCard";
import { StatWidget } from "@/components/admin/StatWidget";
import { CalendarClock, TrendingUp, UserMinus, UserPlus } from "lucide-react";

const projection = [
  { label: "Jul", hires: 4, demand: 6 },
  { label: "Aug", hires: 6, demand: 8 },
  { label: "Sep", hires: 5, demand: 7 },
  { label: "Oct", hires: 8, demand: 10 },
  { label: "Nov", hires: 7, demand: 9 },
  { label: "Dec", hires: 9, demand: 11 },
];

export default function ForecastPage() {
  return (
    <div className="space-y-5 p-4 lg:p-6">
      <AdminPageHeader title="Recruitment Forecast" subtitle="AI projection of hiring demand and capacity." draft />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatWidget label="Expected hires (Q3)" value={18} icon={UserPlus} tone="emerald" draft />
        <StatWidget label="Projected attrition" value={4} icon={UserMinus} tone="rose" draft />
        <StatWidget label="Upcoming interviews" value={26} icon={CalendarClock} tone="accent" draft />
        <StatWidget label="Demand index" value="1.3x" icon={TrendingUp} tone="amber" draft />
      </div>

      <ChartCard
        title="Hiring Demand vs Capacity"
        subtitle="Projected over the next two quarters"
        draft
        type="area"
        data={projection}
        series={[
          { key: "demand", color: "#a855f7", label: "Demand" },
          { key: "hires", color: "#22c55e", label: "Capacity" },
        ]}
      />
    </div>
  );
}
