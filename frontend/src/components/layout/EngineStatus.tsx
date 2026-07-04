import { Cpu } from "lucide-react";

const services = [
  { name: "NLP Service", state: "Online", color: "#22c55e" },
  { name: "Computer Vision", state: "Online", color: "#22c55e" },
  { name: "Data Security", state: "Secure", color: "#38bdf8" },
  { name: "AI Models", state: "Active", color: "#a855f7" },
];

export function EngineStatus() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#11132b] p-4 text-white">
      <div className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-violet-500/30 blur-2xl" />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
            <Cpu className="h-4 w-4 text-violet-300" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">AI Engine</p>
            <p className="text-[11px] text-white/60">All systems operational</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Live
        </span>
      </div>
      <ul className="relative mt-3 space-y-2">
        {services.map((s) => (
          <li key={s.name} className="flex items-center justify-between text-[11px]">
            <span className="text-white/70">{s.name}</span>
            <span className="inline-flex items-center gap-1.5 text-white/80">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
              {s.state}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
