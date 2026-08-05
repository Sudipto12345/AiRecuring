"use client";

import { PageHero } from "@/components/ui/PageHero";
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
  const bgSvgPattern = "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232a7553' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

  return (
    <div className="space-y-6 p-4 lg:p-6 min-h-screen" style={{ backgroundImage: bgSvgPattern }}>
      <PageHero
        title="Recruitment Capacity Forecast"
        subtitle="Predictive AI capacity modeling, demand forecasting, and future hiring velocity planning"
        badge="AI Forecast"
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="animate-fade-slide-up stagger-1">
          <StatWidget label="Expected Hires (Q3)" value={18} icon={UserPlus} tone="emerald" />
        </div>
        <div className="animate-fade-slide-up stagger-2">
          <StatWidget label="Projected Attrition" value={4} icon={UserMinus} tone="rose" />
        </div>
        <div className="animate-fade-slide-up stagger-3">
          <StatWidget label="Upcoming Interviews" value={26} icon={CalendarClock} tone="accent" />
        </div>
        <div className="animate-fade-slide-up stagger-4">
          <StatWidget label="Demand Index" value="1.3x" icon={TrendingUp} tone="amber" />
        </div>
      </div>

      <div className="animate-fade-slide-up stagger-5">
        <ChartCard
          title="Hiring Demand vs Capacity Projection"
          subtitle="Projected candidate acquisition vs target headcounts over the next two quarters"
          type="area"
          data={projection}
          height={320}
          series={[
            { key: "demand", color: "#8b5cf6", label: "Demand" },
            { key: "hires", color: "#2a7553", label: "Capacity" },
          ]}
        />
      </div>
    </div>
  );
}

