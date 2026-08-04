import Image from "next/image";
import { BarChart3, Bot, ShieldCheck, Sparkles } from "lucide-react";

const points = [
  { icon: Bot, title: "AI CV ranking", desc: "Score and rank candidates by skills, experience and education." },
  { icon: Sparkles, title: "Smart screening", desc: "Automated parsing and shortlisting in minutes, not days." },
  { icon: ShieldCheck, title: "Proctored interviews", desc: "Integrity monitoring built in." },
  { icon: BarChart3, title: "Pipeline analytics", desc: "Full funnel visibility from applied to hired." },
];

export function AuthHero() {
  return (
    <div className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-950 to-emerald-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-teal-600/20 blur-3xl" />
      
      <div className="relative max-w-md">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" /> AI Engine Operational
        </span>
        <h2 className="mt-6 text-3xl font-bold leading-tight">
          Build your company with <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Peaceful AI Precision</span>
        </h2>
        <p className="mt-3 text-sm text-slate-300">
          From bulk CV ingestion to proctored interviews, AIRecruit gives your team decision-support at every stage.
        </p>

        <div className="mt-6 relative w-full h-44 rounded-2xl overflow-hidden shadow-2xl border border-emerald-500/20 group">
          <Image
            src="/images/auth/register-hero.png"
            alt="New Company Registration"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        <ul className="mt-6 space-y-3.5">
          {points.map((p) => (
            <li key={p.title} className="flex gap-3 items-center">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p.icon className="h-4 w-4 text-emerald-400" />
              </span>
              <div>
                <p className="text-xs font-bold text-white">{p.title}</p>
                <p className="text-[11px] text-slate-400">{p.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative z-10 text-xs text-slate-500">AIRecruit Platform · Trusted Enterprise Hiring</p>
    </div>
  );
}
