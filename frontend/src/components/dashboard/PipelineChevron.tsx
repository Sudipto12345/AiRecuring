const STAGES = ["Applied", "AI Screened", "AI Shortlisted", "Interview", "Offer", "Hired"] as const;

const STAGE_COLORS: Record<string, string> = {
  Applied: "#6366f1",
  "AI Screened": "#7c6cf0",
  "AI Shortlisted": "#9b7bf0",
  Interview: "#22c55e",
  Offer: "#f59e0b",
  Hired: "#0ea5e9",
};

export interface PipelineChevronStage {
  label: string;
  count: number;
}

export function PipelineChevron({ stages }: { stages: PipelineChevronStage[] }) {
  const byLabel = Object.fromEntries(stages.map((s) => [s.label, s.count]));
  const items = STAGES.map((label) => ({ label, count: byLabel[label] ?? 0 }));

  return (
    <div className="flex flex-wrap items-stretch gap-1">
      {items.map((s, i) => {
        const color = STAGE_COLORS[s.label] ?? "#6366f1";
        const isLast = i === items.length - 1;
        return (
          <div key={s.label} className="flex min-w-[88px] flex-1 items-stretch">
            <div
              className="relative flex flex-1 flex-col items-center justify-center rounded-lg px-2 py-3 text-center text-white shadow-sm"
              style={{
                backgroundColor: color,
                clipPath: isLast
                  ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
                  : "polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)",
                paddingRight: isLast ? undefined : 14,
              }}
            >
              <p className="text-[10px] font-medium leading-tight opacity-90">{s.label}</p>
              <p className="mt-0.5 text-lg font-bold tabular-nums">{s.count.toLocaleString()}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
