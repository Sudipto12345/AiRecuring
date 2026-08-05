"use client";

import { PageHero } from "@/components/ui/PageHero";
import { Card } from "@/components/ui/Card";
import { Activity, Database, Users, FileText, AlertTriangle } from "lucide-react";
import { useApi } from "@/lib/swr";
import { StatCard } from "@/components/ui/StatCard";

interface UsageData {
  api_calls: { used: number; limit: number };
  storage_mb: { used: number; limit: number };
  candidates: { used: number; limit: number };
  exams: { used: number; limit: number };
}

export default function UsagePage() {
  const { data, isLoading } = useApi<UsageData>("/billing/usage");

  // Mock data if API doesn't return
  const usage = data || {
    api_calls: { used: 4500, limit: 10000 },
    storage_mb: { used: 4.2, limit: 10 },
    candidates: { used: 85, limit: 100 },
    exams: { used: 12, limit: 50 },
  };

  const getPercent = (used: number, limit: number) => Math.min(100, Math.round((used / limit) * 100));

  const limits = [
    { key: "api_calls", label: "API Calls", icon: Activity, used: usage.api_calls.used, limit: usage.api_calls.limit, unit: "calls" },
    { key: "storage_mb", label: "Storage", icon: Database, used: usage.storage_mb.used, limit: usage.storage_mb.limit, unit: "GB" },
    { key: "candidates", label: "Candidates Processed", icon: Users, used: usage.candidates.used, limit: usage.candidates.limit, unit: "candidates" },
    { key: "exams", label: "Exams Sent", icon: FileText, used: usage.exams.used, limit: usage.exams.limit, unit: "exams" },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      <PageHero
        title="Usage & Limits"
        subtitle="Track your resource usage for the current billing period."
        icon={Activity}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {limits.map((item) => (
          <StatCard
            key={item.key}
            title={item.label}
            value={isLoading ? "..." : item.used.toString()}
            icon={item.icon}
            description={`of ${item.limit} ${item.unit} limit`}
          />
        ))}
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">Plan Limits</h2>
        <div className="space-y-6">
          {limits.map((item) => {
            const percent = getPercent(item.used, item.limit);
            const isOverage = percent > 80;
            return (
              <div key={item.key}>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <h4 className="font-medium text-[var(--color-text-primary)] flex items-center">
                      {item.label}
                      {isOverage && (
                        <AlertTriangle className="h-4 w-4 ml-2 text-amber-500" />
                      )}
                    </h4>
                  </div>
                  <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                    {item.used} / {item.limit}
                  </span>
                </div>
                <div className="h-2 w-full bg-[var(--color-bg-alt)] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isOverage ? "bg-amber-500" : "bg-[var(--admin-accent)]"}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                {isOverage && (
                  <p className="text-xs text-amber-600 mt-1">You are approaching your limit for this resource.</p>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
