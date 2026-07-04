"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ChartCard } from "@/components/admin/ChartCard";

const trend = [
  { label: "Jan", applications: 220, hires: 6 },
  { label: "Feb", applications: 280, hires: 8 },
  { label: "Mar", applications: 260, hires: 7 },
  { label: "Apr", applications: 340, hires: 10 },
  { label: "May", applications: 410, hires: 12 },
  { label: "Jun", applications: 460, hires: 14 },
];

const sources = [
  { label: "Career Portal", value: 38, color: "#6366f1" },
  { label: "Referrals", value: 24, color: "#22c55e" },
  { label: "LinkedIn", value: 21, color: "#0ea5e9" },
  { label: "Job Boards", value: 17, color: "#f59e0b" },
];

export default function TrendsPage() {
  return (
    <div className="space-y-5 p-4 lg:p-6">
      <AdminPageHeader title="Hiring Trends" subtitle="Volume, conversion and source trends over time." draft />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard
          title="Applications vs Hires"
          subtitle="Monthly trend"
          draft
          type="line"
          data={trend}
          series={[
            { key: "applications", color: "#6366f1", label: "Applications" },
            { key: "hires", color: "#22c55e", label: "Hires" },
          ]}
        />
        <ChartCard title="Candidate Sources" subtitle="Share of applications" draft type="pie" data={sources} series={[{ key: "value", color: "#6366f1" }]} />
      </div>
    </div>
  );
}
