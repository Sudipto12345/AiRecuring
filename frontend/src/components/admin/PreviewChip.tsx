import { cn } from "@/lib/utils";

export function PreviewChip({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600",
        className,
      )}
      title="Sample numbers — hook up the API when ready"
    >
      draft
    </span>
  );
}
