import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const toneMap: Record<string, { badge: string; glow: string }> = {
  accent: {
    badge: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    glow: "group-hover:shadow-md",
  },
  emerald: {
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    glow: "group-hover:shadow-md",
  },
  amber: {
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    glow: "group-hover:shadow-md",
  },
  rose: {
    badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    glow: "group-hover:shadow-md",
  },
  sky: {
    badge: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    glow: "group-hover:shadow-md",
  },
};

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
  const t = toneMap[tone] ?? toneMap.accent;
  return (
    <div className={cn(
      "a-card group relative overflow-hidden rounded-2xl p-3.5 sm:p-4 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5",
      t.glow
    )}>
      {draft && (
        <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_#f59e0b]" title="Preview" />
      )}
      <div className="flex items-center gap-3">
        {Icon && (
          <span className={cn("flex h-9 w-9 sm:h-10 sm:w-10 flex-none items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105", t.badge)}>
            <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-bold uppercase tracking-wider a-faint">{label}</p>
          <p className="mt-0.5 text-base font-bold tracking-tight a-text tabular-nums sm:text-lg lg:text-xl">{value}</p>
        </div>
      </div>
      {delta && (
        <div className="mt-2.5 flex items-center gap-1 border-t a-border pt-2">
          <span className={cn(
            "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold border",
            delta.up
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400"
          )}>
            {delta.up ? "↑" : "↓"} {delta.value}
          </span>
        </div>
      )}
    </div>
  );
}
