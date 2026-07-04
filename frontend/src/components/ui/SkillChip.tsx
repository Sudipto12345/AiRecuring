import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export function SkillChip({ label, matched }: { label: string; matched?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium",
        matched ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-ink-600",
      )}
    >
      {matched && <Check className="h-3 w-3" />}
      {label}
    </span>
  );
}
