export interface PipelineStage {
  label: string;
  count: number;
  pct: number;
  color: string;
}

export function PipelineFunnel({ stages }: { stages: PipelineStage[] }) {
  return (
    <div className="space-y-2.5">
      {stages.map((s, i) => {
        const width = 100 - i * 14;
        return (
          <div key={s.label} className="flex items-center gap-4">
            <div className="flex flex-1 justify-center" style={{ paddingInline: `${i * 7}%` }}>
              <div
                className="flex h-11 items-center justify-center rounded-lg text-sm font-medium text-white shadow-sm"
                style={{ width: `${width}%`, backgroundColor: s.color }}
              >
                {s.label}
              </div>
            </div>
            <div className="w-28 shrink-0 text-right">
              <p className="text-sm font-semibold text-ink-900">{s.count.toLocaleString()}</p>
              <p className="text-[11px] text-ink-400">{s.pct}%</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
