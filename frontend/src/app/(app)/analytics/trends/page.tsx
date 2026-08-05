"use client";

import { PageHero } from "@/components/ui/PageHero";
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
  { label: "Career Portal", value: 38, color: "#2a7553" },
  { label: "Referrals", value: 24, color: "#16a34a" },
  { label: "LinkedIn", value: 21, color: "#0ea5e9" },
  { label: "Job Boards", value: 17, color: "#d97706" },
];

export default function TrendsPage() {
  const bgSvgPattern = "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232a7553' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

  return (
    <div className="space-y-6 p-4 lg:p-6 min-h-screen" style={{ backgroundImage: bgSvgPattern }}>
      <PageHero
        title="Hiring Velocity & Trends"
        subtitle="Longitudinal metrics on candidate application volume, acquisition channel attribution, and time-to-hire"
        badge="Historical Trends"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="animate-fade-slide-up stagger-1">
          <ChartCard
            title="Applications vs Hires Volume"
            subtitle="Monthly applicant pipeline intake compared against final offer accepts"
            type="line"
            data={trend}
            height={280}
            series={[
              { key: "applications", color: "#2a7553", label: "Applications" },
              { key: "hires", color: "#16a34a", label: "Hires" },
            ]}
          />
        </div>
        <div className="animate-fade-slide-up stagger-2">
          <ChartCard 
            title="Candidate Acquisition Channels" 
            subtitle="Share of inbound candidates by sourcing channel" 
            type="pie" 
            data={sources} 
            height={280}
            series={[{ key: "value", color: "#2a7553" }]} 
          />
        </div>
      </div>
    </div>
  );
}

