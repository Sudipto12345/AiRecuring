import { BarChart3, Bot, ShieldCheck, Sparkles } from "lucide-react";

const points = [
  { icon: Bot, title: "AI CV ranking", desc: "Score and rank candidates by skills, experience and education." },
  { icon: Sparkles, title: "Smart screening", desc: "Automated parsing and shortlisting in minutes, not days." },
  { icon: ShieldCheck, title: "Proctored interviews", desc: "Facial recognition and integrity monitoring built in." },
  { icon: BarChart3, title: "Pipeline analytics", desc: "Full funnel visibility from applied to hired." },
];

export function AuthHero() {
  return (
    <div className="relative hidden overflow-hidden bg-[#0f1230] p-12 text-white lg:flex lg:flex-col lg:justify-center">
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-indigo-600/30 blur-3xl" />
      <div className="relative max-w-md">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> AI Engine operational
        </span>
        <h2 className="mt-6 text-3xl font-bold leading-tight">
          Hire smarter with an <span className="text-gradient-brand">AI-powered</span> pipeline.
        </h2>
        <p className="mt-3 text-sm text-white/60">
          From bulk CV ingestion to proctored interviews, AIRecruit gives your team decision-support at every stage.
        </p>

        <ul className="mt-9 space-y-5">
          {points.map((p) => (
            <li key={p.title} className="flex gap-3.5">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <p.icon className="h-[18px] w-[18px] text-violet-300" />
              </span>
              <div>
                <p className="text-sm font-semibold">{p.title}</p>
                <p className="text-xs text-white/55">{p.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
