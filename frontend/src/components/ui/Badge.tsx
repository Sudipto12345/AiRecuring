import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Variant =
  | "default"
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "error"
  | "info"
  | "purple";

type Size = "sm" | "md" | "lg";

// ─── Variant styles ───────────────────────────────────────────────────────────

const variantStyles: Record<Variant, string> = {
  default: "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300",
  brand:   "bg-brand-50 text-brand-700 border border-brand-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  success: "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  warning: "bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  danger:  "bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
  error:   "bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
  info:    "bg-sky-50 text-sky-700 border border-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800",
  purple:  "bg-purple-50 text-purple-700 border border-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
};

// ─── Dot colors (matched to each variant) ────────────────────────────────────

const dotStyles: Record<Variant, string> = {
  default: "bg-slate-400",
  brand:   "bg-brand-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger:  "bg-rose-500",
  error:   "bg-rose-500",
  info:    "bg-sky-500",
  purple:  "bg-purple-500",
};

// ─── Size styles ──────────────────────────────────────────────────────────────

const sizeStyles: Record<Size, string> = {
  sm: "text-[10px] px-2 py-0.5",
  md: "text-xs px-2.5 py-0.5",
  lg: "text-sm px-3 py-1",
};

// ─── Badge ────────────────────────────────────────────────────────────────────

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Visual style variant. Defaults to `"default"`. */
  variant?: Variant;
  /** Legacy/alias prop for variant. */
  tone?: string;
  /** Size preset. Defaults to `"md"`. */
  size?: Size;
  /** When `true`, renders a colored dot before the badge text. */
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}

const TONE_MAP: Record<string, Variant> = {
  green: "success",
  success: "success",
  amber: "warning",
  warning: "warning",
  rose: "danger",
  danger: "danger",
  error: "error",
  slate: "default",
  default: "default",
  blue: "info",
  info: "info",
  indigo: "brand",
  brand: "brand",
  violet: "purple",
  purple: "purple",
};

export function Badge({
  variant = "default",
  tone,
  size = "md",
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  const activeVariant = tone ? (TONE_MAP[tone] ?? variant) : variant;

  return (
    <span
      className={cn(
        // base
        "inline-flex items-center gap-1 font-medium rounded-full transition-all duration-200",
        // size
        sizeStyles[size],
        // variant
        variantStyles[activeVariant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "shrink-0 rounded-full",
            size === "lg" ? "h-2 w-2" : "h-1.5 w-1.5",
            dotStyles[activeVariant],
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

// ─── StageBadge ───────────────────────────────────────────────────────────────

const STAGE_VARIANT: Record<string, Variant> = {
  "AI Shortlisted":      "success",
  Shortlisted:           "success",
  Interview:             "warning",
  "Interview Scheduled": "info",
  "Assessment Sent":     "purple",
  "Under Review":        "warning",
  "AI Screened":         "brand",
  Applied:               "default",
  Offer:                 "purple",
  Hired:                 "success",
  Rejected:              "danger",
};

export function StageBadge({ stage }: { stage: string }) {
  return (
    <Badge variant={STAGE_VARIANT[stage] ?? "default"} dot>
      {stage}
    </Badge>
  );
}
