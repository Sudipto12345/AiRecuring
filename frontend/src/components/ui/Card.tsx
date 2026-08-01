import { cn } from '@/lib/utils';

// ─── Card ────────────────────────────────────────────────────────────────────
/**
 * Base card container.
 * Includes a subtle inner top highlight via a ::before pseudo-element.
 */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        // Layout & shape
        'relative rounded-2xl overflow-hidden',
        // Surface
        'bg-white border border-slate-100',
        // Shadow
        'shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]',
        // Hover transition
        'transition-shadow duration-300',
        // Inner top highlight (::before)
        'before:absolute before:inset-x-0 before:top-0 before:h-px',
        'before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
        'before:pointer-events-none',
        className,
      )}
      {...props}
    />
  );
}

// ─── CardHeader ──────────────────────────────────────────────────────────────
export interface CardHeaderProps {
  /** Primary heading text */
  title?: React.ReactNode;
  /** Supporting description below the title */
  subtitle?: React.ReactNode;
  /** Optional badge/tag rendered next to the title */
  badge?: React.ReactNode;
  /** Trailing action slot (button, menu, etc.) */
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, badge, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-3 px-5 pt-5', className)}>
      <div className="min-w-0 flex-1">
        {title && (
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[16px] font-bold text-ink-900 leading-snug">{title}</h3>
            {badge && <span className="shrink-0">{badge}</span>}
          </div>
        )}
        {subtitle && (
          <p className="mt-1 text-xs text-ink-500 leading-relaxed">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ─── CardBody ────────────────────────────────────────────────────────────────
/**
 * Padded content area for the main body of a card.
 */
export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 pb-5', className)} {...props} />;
}

// ─── CardFooter ──────────────────────────────────────────────────────────────
/**
 * Footer row with a top divider, typically used for actions or meta information.
 */
export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'border-t border-slate-100 px-5 py-3 flex items-center justify-between',
        className,
      )}
      {...props}
    />
  );
}

// ─── CardDivider ─────────────────────────────────────────────────────────────
/**
 * Horizontal rule with consistent card horizontal padding.
 */
export function CardDivider({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn('border-slate-100 mx-5', className)} {...props} />;
}
