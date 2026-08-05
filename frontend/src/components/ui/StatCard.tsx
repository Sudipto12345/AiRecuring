import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { Sparkline } from '@/components/charts/Sparkline';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  label?: string;
  title?: string;
  value: string;
  delta?: number;
  deltaSuffix?: string;
  footnote?: string;
  description?: string;
  icon: LucideIcon;
  accent?: string;
  spark?: number[];
}

export function StatCard({
  label,
  title,
  value,
  delta,
  deltaSuffix = 'vs last 7 days',
  footnote,
  description,
  icon: Icon,
  accent = '#2a7553',
  spark,
}: StatCardProps) {
  const displayLabel = label || title || '';
  const displayFootnote = footnote || description;
  const up = (delta ?? 0) >= 0;
  const hasDelta = delta !== undefined && delta !== null;

  return (
    <Card
      className={cn(
        // Base layout
        'relative overflow-hidden p-5',
        // Shape & border
        'rounded-2xl border-0',
        // Background gradient overlay
        'bg-gradient-to-br from-white to-slate-50/50',
        // Shadow + hover lift
        'shadow-md hover:shadow-xl',
        'translate-y-0 hover:-translate-y-1',
        'transition-all duration-300 ease-out',
        // Cursor
        'cursor-default select-none',
      )}
      style={
        {
          borderLeft: `4px solid ${accent}`,
        } as React.CSSProperties
      }
    >
      {/* Subtle radial glow in top-right corner matching accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full opacity-10 blur-2xl"
        style={{ backgroundColor: accent }}
      />

      {/* Top row: label + icon */}
      <div className="flex items-start justify-between">
        <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-ink-400">
          {displayLabel}
        </span>

        {/* Icon box with glow */}
        <span
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 hover:scale-110"
          style={{
            backgroundColor: `${accent}1a`,
            color: accent,
            boxShadow: `0 4px 14px 0 ${accent}40`,
          }}
        >
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </span>
      </div>

      {/* Value */}
      <div
        className="mt-3 text-[2rem] font-bold leading-none tracking-tight text-ink-900"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </div>

      {/* Delta pill + suffix */}
      {hasDelta && (
        <div className="mt-2 flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold',
              up
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
            )}
          >
            {up ? (
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            )}
            {up ? '+' : ''}
            {delta}%
          </span>
          <span className="text-xs text-ink-400">{deltaSuffix}</span>
        </div>
      )}

      {/* Footnote */}
      {displayFootnote && (
        <p className="mt-1 text-xs text-ink-400">{displayFootnote}</p>
      )}

      {/* Sparkline: full-width, flush to bottom */}
      {spark && spark.length > 0 && (
        <div className="absolute inset-x-0 bottom-0 h-12 opacity-70">
          <Sparkline data={spark} color={accent} />
        </div>
      )}

      {/* Spacer so content does not overlap sparkline */}
      {spark && spark.length > 0 && <div className="mt-4 h-8" />}
    </Card>
  );
}
