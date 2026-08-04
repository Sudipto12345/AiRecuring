"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Bot,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  Cpu,
  Database,
  ExternalLink,
  Gauge,
  Globe,
  HardDrive,
  Layers,
  MemoryStick,
  Server,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Video,
  Wallet,
  Zap,
} from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ChartCard } from "@/components/admin/ChartCard";
import { StatWidget } from "@/components/admin/StatWidget";
import { LottiePlayer } from "@/components/ui/LottiePlayer";
import { api } from "@/lib/api";
import type { AdminOverview } from "@/lib/types";

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");

  // Live ticking clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) +
        " · " +
        now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    api<AdminOverview>("/admin/overview").then(setData).catch(() => setData(null));
  }, []);

  const k = data?.kpis;
  const r = data?.revenue;
  const inf = data?.infra_sample;
  const usd = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  return (
    <div className="relative space-y-5 bg-3d-vector-panning bg-grid-pattern p-3.5 rounded-3xl select-none font-sans shadow-2xl overflow-hidden border a-border">
      {/* Ambient Radial Mesh Glow Spheres */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl animate-glow-slow" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-500/15 blur-3xl animate-glow-fast" />

      {/* ── Top Header with Ticking Live Clock ── */}
      <AdminPageHeader
        title="Executive Control Deck"
        subtitle="Platform management, financial performance & infrastructure load."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl border a-border a-surface px-3 py-1.5 text-xs font-semibold a-text shadow-sm backdrop-blur-xl">
              <Clock className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
              <span className="font-mono text-[11px] tabular-nums">{currentTime || "Loading time…"}</span>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-400 backdrop-blur-xl">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              System Operational
            </span>
          </div>
        }
      />

      {/* ── AI Executive Copilot Quick Prompt Launcher Banner ── */}
      <div className="a-card relative overflow-hidden rounded-2xl border a-border bg-gradient-to-r from-indigo-900/30 via-purple-900/20 to-transparent p-5 backdrop-blur-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/30 overflow-hidden group">
              <LottiePlayer 
                url="https://assets1.lottiefiles.com/packages/lf20_xvrofzfk.json" 
                className="h-24 w-24 object-cover scale-150 transition-transform group-hover:scale-110" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold tracking-tight a-text">AIRecruit Executive Copilot</h2>
                <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[9px] font-bold text-indigo-300 border border-indigo-500/30">AWS Bedrock Active</span>
              </div>
              <p className="text-xs a-faint">Instant platform queries, revenue forecasts & automated compliance checks.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              "📊 Revenue Forecast",
              "🏢 Audit Companies",
              "🤖 Check Bedrock Status",
            ].map((prompt, idx) => (
              <button
                key={idx}
                className="rounded-xl border a-border a-surface hover:a-border-strong px-3.5 py-1.5 text-xs font-semibold a-text shadow-sm hover:scale-105 transition-all backdrop-blur-xl"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Vector Telemetry HUD Ribbon ── */}
      <div className="a-card flex flex-wrap items-center justify-between gap-3 p-3.5 backdrop-blur-2xl">
        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <Server className="h-3.5 w-3.5 text-indigo-400" />
            <span className="a-faint">AWS Cluster:</span>
            <span className="font-bold a-text">ap-south-1</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5 text-purple-400" />
            <span className="a-faint">Database:</span>
            <span className="font-bold a-text">MongoDB Replica</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span className="a-faint">Bedrock Engine:</span>
            <span className="font-bold a-text">Claude 3.7 Sonnet</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <div className="hidden lg:block h-6 w-12 opacity-80 mix-blend-screen">
            <LottiePlayer url="https://assets3.lottiefiles.com/packages/lf20_qp1q7mct.json" className="h-full w-full object-cover" />
          </div>
          <div className="flex items-center gap-1">
            <span className="a-faint">CPU:</span>
            <span className="font-bold a-text tabular-nums">{inf ? `${inf.cpu_pct}%` : "14%"}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="a-faint">Latency:</span>
            <span className="font-bold text-emerald-400 tabular-nums">0.8ms</span>
          </div>
        </div>
      </div>

      {/* ── Quick Action Management Cards (3D Depth Effects) ── */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            tag: "Verification Queue",
            title: "Pending Approvals",
            desc: "Audit business registration & legal documents",
            href: "/admin/companies/verification",
            btn: "Review Queue",
            icon: BadgeCheck,
            color: "indigo",
          },
          {
            tag: "Tenant Management",
            title: "Company Workspaces",
            desc: "Manage plan tiers, credits & access rules",
            href: "/admin/companies",
            btn: "Manage Workspaces",
            icon: Building2,
            color: "emerald",
          },
          {
            tag: "AI Architecture",
            title: "Model Configuration",
            desc: "Configure LLMs, prompts & Bedrock settings",
            href: "/admin/ai/providers",
            btn: "Configure AI",
            icon: Sparkles,
            color: "purple",
          },
        ].map((card) => {
          const TagIcon = card.icon;
          const tagColor = card.color === "indigo" ? "text-indigo-400"
            : card.color === "emerald" ? "text-emerald-400"
            : "text-purple-400";
          const btnGradient = card.color === "indigo" ? "from-indigo-600 to-purple-600"
            : card.color === "emerald" ? "from-emerald-600 to-teal-600"
            : "from-purple-600 to-pink-600";

          return (
            <div key={card.tag} className="a-card group flex flex-col justify-between p-4.5 backdrop-blur-2xl">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${tagColor}`}>
                    <TagIcon className="h-3.5 w-3.5" />
                    {card.tag}
                  </span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold a-text">{card.title}</h3>
                  <p className="mt-0.5 text-xs a-faint">{card.desc}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t a-border flex items-center justify-between">
                <span className="text-[10px] a-faint font-medium">Quick Route</span>
                <Link
                  href={card.href}
                  className={`flex items-center gap-1 rounded-xl bg-gradient-to-r ${btnGradient} px-3.5 py-1.5 text-xs font-semibold text-white shadow-md hover:brightness-110 transition-all hover:scale-105`}
                >
                  {card.btn} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Financial Performance Deck ── */}
      <section>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest a-faint">Financial Performance</p>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatWidget label="MRR Trajectory" value={r ? usd(r.mrr) : "—"} icon={Wallet} draft tone="emerald" delta={{ value: "+14.2%", up: true }} />
          <StatWidget label="Annual Run-Rate" value={r ? usd(r.arr) : "—"} icon={TrendingUp} draft tone="emerald" delta={{ value: "+18.5%", up: true }} />
          <StatWidget label="Today's Tally" value={r ? usd(r.today) : "—"} icon={Coins} draft tone="amber" delta={{ value: "+5.1%", up: true }} />
          <StatWidget label="AI Credits Spent" value={k?.ai_credits_spent.toLocaleString() ?? "—"} icon={Coins} tone="accent" delta={{ value: "+24.0%", up: true }} />
        </div>
      </section>

      {/* ── Featured Workspaces Grid Spotlight ── */}
      <section className="a-card rounded-2xl border p-4 space-y-3 backdrop-blur-2xl">
        <div className="flex items-center justify-between border-b a-border pb-2.5">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider a-text">Featured Enterprise Workspaces</h3>
          </div>
          <Link href="/admin/companies" className="text-xs text-indigo-400 font-semibold hover:underline flex items-center gap-1">
            View All Workspaces <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
          {[
            { name: "Acme Global Corp", plan: "Enterprise Pro", credits: "45,000", verified: true },
            { name: "TechCorp Labs", plan: "Growth Tier", credits: "18,200", verified: true },
            { name: "DevStudio Inc", plan: "Starter Tier", credits: "5,400", verified: false },
          ].map((co, idx) => (
            <div key={idx} className="rounded-xl a-surface-2 p-3 border a-border space-y-2 hover:border-indigo-500/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="font-bold a-text text-[13px]">{co.name}</span>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                  co.verified ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                }`}>
                  {co.verified ? "Verified" : "Pending"}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="a-faint font-medium">{co.plan}</span>
                <span className="font-bold a-text tabular-nums">{co.credits} credits</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Global Platform Operations Sequence ── */}
      <section>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest a-faint">Global Platform Activity</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatWidget label="Workspaces" value={k?.companies ?? "—"} icon={Building2} />
          <StatWidget label="Users" value={k?.users ?? "—"} icon={Users} tone="emerald" />
          <StatWidget label="Candidates" value={k?.candidates ?? "—"} icon={Users} tone="sky" />
          <StatWidget label="Published Jobs" value={k?.jobs ?? "—"} icon={Briefcase} tone="amber" />
          <StatWidget label="AI Interviews" value={k?.interviews ?? "—"} icon={Video} tone="accent" />
          <StatWidget label="AI Requests" value={k?.ai_requests ?? "—"} icon={Bot} tone="accent" />
        </div>
      </section>

      {/* ── Node Infrastructure Load Gauges ── */}
      <section>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest a-faint">Infrastructure Telemetry</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatWidget label="CPU Load" value={inf ? `${inf.cpu_pct}%` : "—"} icon={Cpu} draft />
          <StatWidget label="RAM Usage" value={inf ? `${inf.ram_pct}%` : "—"} icon={MemoryStick} draft />
          <StatWidget label="Worker Queue" value={inf?.queue_depth ?? "—"} icon={Activity} draft />
          <StatWidget label="API Error Rate" value={inf ? `${inf.error_rate_pct}%` : "—"} icon={Activity} draft tone="rose" />
          <StatWidget label="Requests (24h)" value={inf?.api_requests_24h.toLocaleString() ?? "—"} icon={Gauge} draft />
          <StatWidget label="Storage Used" value={data ? `${data.storage.used_gb} GB` : "—"} icon={HardDrive} draft tone="sky" />
        </div>
      </section>

      {/* ── Analytics Trends ── */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <ChartCard
          title="Revenue Growth Trajectory"
          subtitle="Monthly recurring revenue trajectory"
          draft
          type="area"
          height={240}
          data={data?.charts.revenue ?? []}
          series={[{ key: "revenue", color: "#10b981" }]}
        />
        <ChartCard
          title="AI Token Consumption"
          subtitle="AI Requests & credit throughput per month"
          type="bar"
          height={240}
          data={data?.charts.ai_usage ?? []}
          series={[{ key: "credits", color: "#6366f1" }]}
        />
      </div>
    </div>
  );
}
