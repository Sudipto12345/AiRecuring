import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

import { Sparkline } from "@/components/charts/Sparkline";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: string;
  delta?: number;
  deltaSuffix?: string;
  footnote?: string;
  icon: LucideIcon;
  accent: string;
  spark?: number[];
}

export function StatCard({ label, value, delta, deltaSuffix = "vs last 7 days", footnote, icon: Icon, accent, spark }: StatCardProps) {
  const up = (delta ?? 0) >= 0;
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <span className="text-sm text-ink-500">{label}</span>
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accent}1a`, color: accent }}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">{value}</div>
      {delta !== undefined && (
        <div className="mt-1 flex items-center gap-1 text-xs">
          <span className={cn("inline-flex items-center font-semibold", up ? "text-emerald-600" : "text-rose-600")}>
            {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(delta)}%
          </span>
          <span className="text-ink-400">{deltaSuffix}</span>
        </div>
      )}
      {footnote && !delta && <p className="mt-1 text-xs text-ink-400">{footnote}</p>}
      {spark && (
        <div className="mt-2">
          <Sparkline data={spark} color={accent} />
        </div>
      )}
    </Card>
  );
}
