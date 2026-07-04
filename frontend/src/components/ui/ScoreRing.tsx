import { scoreBand } from "@/lib/utils";

export function ScoreRing({
  score,
  size = 60,
  stroke = 5,
  showLabel = true,
}: {
  score: number;
  size?: number;
  stroke?: number;
  showLabel?: boolean;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const offset = c - (pct / 100) * c;
  const band = scoreBand(score);

  return (
    <div className="inline-flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef0f4" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={band.color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-semibold leading-none text-ink-900"
            style={{ fontSize: size * 0.26 }}
          >
            {score.toFixed(1)}
          </span>
        </div>
      </div>
      {showLabel && (
        <span className="mt-1 text-[11px] font-medium" style={{ color: band.color }}>
          {band.label}
        </span>
      )}
    </div>
  );
}
