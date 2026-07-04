import { cn } from "@/lib/utils";

type Tone = "green" | "amber" | "orange" | "blue" | "indigo" | "rose" | "slate" | "violet";

const tones: Record<Tone, string> = {
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  orange: "bg-orange-50 text-orange-700",
  blue: "bg-sky-50 text-sky-700",
  indigo: "bg-brand-50 text-brand-700",
  violet: "bg-violet-50 text-violet-700",
  rose: "bg-rose-50 text-rose-700",
  slate: "bg-slate-100 text-slate-600",
};

export function Badge({
  tone = "slate",
  children,
  className,
  dot,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

const STAGE_TONE: Record<string, Tone> = {
  "AI Shortlisted": "green",
  Shortlisted: "green",
  Interview: "amber",
  "Interview Scheduled": "blue",
  "Assessment Sent": "violet",
  "Under Review": "orange",
  "AI Screened": "indigo",
  Applied: "slate",
  Offer: "violet",
  Hired: "green",
  Rejected: "rose",
};

export function StageBadge({ stage }: { stage: string }) {
  return <Badge tone={STAGE_TONE[stage] ?? "slate"}>{stage}</Badge>;
}
