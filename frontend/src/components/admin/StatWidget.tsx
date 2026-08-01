import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function StatWidget({
  label,
  value,
  delta,
  icon: Icon,
  draft,
  tone = "accent",
}: {
  label: string;
  value: string | number;
  delta?: { value: string; up?: boolean };
  icon?: LucideIcon;
  draft?: boolean;
  tone?: "accent" | "emerald" | "amber" | "rose" | "sky";
}) {
  const toneBg: Record<string, string> = {
    accent: "a-accent-soft",
    emerald: "bg-emerald-500/10 text-emerald-500",
    amber: "bg-amber-500/10 text-amber-500",
    rose: "bg-rose-500/10 text-rose-500",
    sky: "bg-sky-500/10 text-sky-500",
  };
  return (
    <div className="a-card relative p-4">
      {draft && (
        <span className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-amber-400" title="draft screen" />
      )}
      <div className="flex items-center gap-3">
        {Icon && (
          <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", toneBg[tone])}>
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-xs a-faint">{label}</p>
          <p className="text-xl font-semibold a-text tabular-nums">{value}</p>
        </div>
      </div>
      {delta && (
        <p className={cn("mt-2 text-xs font-medium", delta.up ? "text-emerald-500" : "text-rose-500")}>
          {delta.up ? "▲" : "▼"} {delta.value}
        </p>
      )}
    </div>
  );
}
