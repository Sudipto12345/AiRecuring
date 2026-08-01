import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  tone = "brand",
  className,
}: {
  value: number;
  tone?: "brand" | "green" | "amber" | "rose";
  className?: string;
}) {
  const fill = {
    brand: "gradient-brand",
    green: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
  }[tone];

  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-slate-100", className)}>
      <div className={cn("h-full rounded-full", fill)} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}

export function MetricBar({
  label,
  value,
  tone = "brand",
}: {
  label: string;
  value: number;
  tone?: "brand" | "green" | "amber" | "rose";
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-xs text-ink-500">{label}</span>
      <ProgressBar value={value} tone={tone} />
      <span className="w-9 shrink-0 text-right text-xs font-semibold text-ink-700">{value}%</span>
    </div>
  );
}
