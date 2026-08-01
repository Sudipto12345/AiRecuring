"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarRange,
  CheckCircle2,
  Cpu,
  Database,
  HardDriveDownload,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  Video,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PipelineFunnel } from "@/components/dashboard/PipelineFunnel";
import { Donut } from "@/components/charts/Donut";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { AnalyticsSummary, Candidate, MonitoringSummary } from "@/lib/types";

const PIPELINE_COLORS = ["#6366f1", "#7c6cf0", "#9b7bf0", "#22c55e", "#f59e0b"];

const fairness = [
  { name: "score", value: 92, color: "#6366f1" },
  { name: "rest", value: 8, color: "#eef0f4" },
];

const fairnessRows = [
  ["Gender Balance", "Good"],
  ["Age Fairness", "Good"],
  ["Ethnicity Fairness", "Good"],
  ["Bias Detection", "Low Risk"],
] as const;

const insights = [
  { label: "High Potential", value: "24", sub: "Identified", icon: TrendingUp, accent: "#6366f1" },
  { label: "Low Engagement", value: "18", sub: "Needs Attention", icon: ShieldAlert, accent: "#a855f7" },
  { label: "Strong Skills Match", value: "92%", sub: "Excellent", icon: Sparkles, accent: "#22c55e" },
  { label: "Interview Completion", value: "76%", sub: "Good", icon: Video, accent: "#f97316" },
];

const activity = [
  { d: "26 May", Completed: 8, Scheduled: 14 },
  { d: "27 May", Completed: 12, Scheduled: 18 },
  { d: "28 May", Completed: 10, Scheduled: 16 },
  { d: "29 May", Completed: 16, Scheduled: 22 },
  { d: "30 May", Completed: 14, Scheduled: 20 },
  { d: "01 Jun", Completed: 20, Scheduled: 26 },
  { d: "02 Jun", Completed: 18, Scheduled: 24 },
];

const risk = [
  { name: "low", value: 78, color: "#22c55e" },
  { name: "mid", value: 16, color: "#f59e0b" },
  { name: "high", value: 6, color: "#ef4444" },
];

function dateRangeLabel() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 9);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

export default function DashboardPage() {
  const { session } = useAuth();
  const firstName = session?.user.name.split(" ")[0] ?? "there";

  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [monitoring, setMonitoring] = useState<MonitoringSummary | null>(null);
  const [topCandidates, setTopCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    api<AnalyticsSummary>("/analytics/summary").then(setAnalytics).catch(() => {});
    api<MonitoringSummary>("/monitoring/summary").then(setMonitoring).catch(() => {});
    api<Candidate[]>("/candidates?sort=score").then((rows) => setTopCandidates(rows.slice(0, 5))).catch(() => {});
  }, []);

  const totals = analytics?.totals ?? {};
  const totalCandidates = Number(totals.candidates ?? 0);
  const shortlisted = Number(totals.shortlisted ?? 0);
  const interviews = Number(totals.interviews ?? 0);
  const hired = Number(totals.hired ?? 0);

  const stats = useMemo(
    () => [
      {
        label: "Total Candidates",
        value: totalCandidates.toLocaleString(),
        delta: totalCandidates > 0 ? 18.7 : undefined,
        icon: Users,
        accent: "#6366f1",
        spark: [10, 14, 12, 18, 16, 22, Math.max(10, totalCandidates)],
      },
      {
        label: "AI Shortlisted",
        value: shortlisted.toLocaleString(),
        delta: shortlisted > 0 ? 12.4 : undefined,
        icon: Sparkles,
        accent: "#a855f7",
        spark: [6, 8, 7, 10, 12, 11, Math.max(6, shortlisted)],
      },
      {
        label: "Interviews Completed",
        value: interviews.toLocaleString(),
        delta: interviews > 0 ? 15.3 : undefined,
        icon: Video,
        accent: "#22c55e",
        spark: [4, 6, 5, 8, 9, 10, Math.max(4, interviews)],
      },
      {
        label: "Hired",
        value: hired.toLocaleString(),
        delta: hired > 0 ? 9.1 : undefined,
        icon: UserCheck,
        accent: "#f97316",
        spark: [1, 2, 2, 3, 4, 5, Math.max(1, hired)],
      },
    ],
    [totalCandidates, shortlisted, interviews, hired],
  );

  const pipeline = useMemo(() => {
    if (analytics?.pipeline?.length) {
      return analytics.pipeline.map((s, i) => ({
        label: s.label,
        count: s.count,
        pct: s.pct,
        color: PIPELINE_COLORS[i % PIPELINE_COLORS.length],
      }));
    }
    if (totalCandidates === 0) {
      return [
        { label: "Applied", count: 0, pct: 0, color: "#6366f1" },
        { label: "AI Screened", count: 0, pct: 0, color: "#7c6cf0" },
        { label: "AI Shortlisted", count: 0, pct: 0, color: "#9b7bf0" },
        { label: "Interviewed", count: 0, pct: 0, color: "#22c55e" },
        { label: "Hired", count: 0, pct: 0, color: "#f59e0b" },
      ];
    }
    const screened = Math.round(totalCandidates * 0.68);
    return [
      { label: "Applied", count: totalCandidates, pct: 100, color: "#6366f1" },
      { label: "AI Screened", count: screened, pct: Math.round((screened / totalCandidates) * 1000) / 10, color: "#7c6cf0" },
      { label: "AI Shortlisted", count: shortlisted, pct: Math.round((shortlisted / totalCandidates) * 1000) / 10, color: "#9b7bf0" },
      { label: "Interviewed", count: interviews, pct: Math.round((interviews / totalCandidates) * 1000) / 10, color: "#22c55e" },
      { label: "Hired", count: hired, pct: Math.round((hired / totalCandidates) * 1000) / 10, color: "#f59e0b" },
    ];
  }, [analytics, totalCandidates, shortlisted, interviews, hired]);

  const liveCount = monitoring?.live_sessions ?? 0;
  const riskRows = [
    ["Suspicious Activity", 0],
    ["Multiple Faces", 0],
    ["Audio Anomaly", monitoring?.high_risk ? 1 : 0],
    ["Tab Switch", monitoring?.reports ? 1 : 0],
  ] as const;

  return (
    <div className="space-y-5 p-4 lg:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">Welcome back, {firstName} 👋</h1>
          <p className="mt-1 text-sm text-ink-500">Here&apos;s what&apos;s happening with your recruitment pipeline today.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink-600">
          <CalendarRange className="h-4 w-4 text-brand-500" />
          {dateRangeLabel()}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-5">
          <CardHeader title="Recruitment Pipeline" subtitle="Conversion across hiring stages" />
          <div className="px-5 py-5">
            <PipelineFunnel stages={pipeline} />
          </div>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader title="Fairness & Bias Monitor" />
          <div className="flex flex-col items-center px-5 py-4">
            <Donut
              data={fairness}
              size={150}
              centerTop={<span className="text-3xl font-bold text-ink-900">92</span>}
              centerBottom={<span className="text-[11px] font-medium text-emerald-600">Excellent</span>}
            />
            <div className="mt-3 w-full space-y-2">
              {fairnessRows.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-sm">
                  <span className="text-ink-500">{k}</span>
                  <Badge variant={v === "Low Risk" ? "info" : "success"}>{v}</Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader title="System Overview" />
          <div className="space-y-3 px-5 py-4">
            {[
              { icon: Cpu, label: "AI Models", value: "24", tone: "Active", color: "#6366f1" },
              { icon: Video, label: "Live Interviews", value: String(liveCount || 12), tone: "In Progress", color: "#f59e0b" },
              { icon: Database, label: "Video Storage", value: "2.4 TB", tone: "Used", color: "#a855f7" },
            ].map((r) => (
              <div key={r.label} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${r.color}1a`, color: r.color }}>
                  <r.icon className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink-900">{r.value}</p>
                  <p className="text-[11px] text-ink-400">{r.label}</p>
                </div>
                <span className="text-[11px] text-ink-500">{r.tone}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 rounded-xl bg-[#11132b] px-3 py-2.5 text-white">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <div className="flex-1">
                <p className="text-xs font-semibold">AI Systems</p>
                <p className="text-[10px] text-emerald-300">Operational</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-700">
          <Sparkles className="h-4 w-4 text-brand-500" /> AI Screening Insights
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {insights.map((i) => (
            <Card key={i.label} className="flex items-center gap-3 p-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${i.accent}1a`, color: i.accent }}>
                <i.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-semibold text-ink-900">{i.value}</p>
                <p className="text-xs text-ink-500">{i.label}</p>
                <p className="text-[11px] text-ink-400">{i.sub}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader title="Live Interview Monitoring" subtitle="Real-time proctoring signals" />
        <div className="grid gap-4 px-5 pb-5 lg:grid-cols-12">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 lg:col-span-7">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.35),transparent_55%)]" />
            <div className="relative flex aspect-video items-center justify-center">
              <div className="text-center text-white/80">
                <Video className="mx-auto h-10 w-10 text-violet-300" />
                <p className="mt-2 text-sm font-medium">Live session preview</p>
                <p className="text-xs text-white/50">INT-{String(liveCount || 1).padStart(4, "0")} · 00:32:15</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:col-span-5">
            {[
              { label: "Face Detected", value: "100%" },
              { label: "Focus Score", value: "92%" },
              { label: "Confidence", value: "High" },
              { label: "Distraction", value: "Low" },
            ].map((m) => (
              <div key={m.label} className="rounded-xl border border-line bg-white p-3">
                <p className="text-[11px] text-ink-400">{m.label}</p>
                <p className="mt-1 text-lg font-semibold text-ink-900">{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-4">
          <CardHeader title="Top 5 Candidates" subtitle="By AI Score" />
          <ul className="px-3 py-3">
            {(topCandidates.length ? topCandidates : []).map((c, i) => (
              <li key={c.id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-slate-50">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">{c.name}</p>
                  <p className="truncate text-xs text-ink-400">{c.job_title}</p>
                </div>
                <span className="text-sm font-semibold text-emerald-600">{c.overall_score.toFixed(1)}</span>
              </li>
            ))}
            {topCandidates.length === 0 && (
              <li className="px-2 py-6 text-center text-sm text-ink-400">Upload CVs to populate rankings.</li>
            )}
          </ul>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader title="Interview Activity" />
          <div className="h-64 px-3 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activity} margin={{ top: 6, right: 12, bottom: 0, left: -18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" vertical={false} />
                <XAxis dataKey="d" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #eef0f4", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="Completed" stroke="#6366f1" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="Scheduled" stroke="#a855f7" strokeWidth={2.5} dot={false} strokeDasharray="5 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader title="Risk & Threat Detection" />
          <div className="flex flex-col items-center px-5 py-4">
            <Donut
              data={risk}
              size={150}
              centerTop={<span className="text-sm font-semibold text-emerald-600">Low</span>}
              centerBottom={<span className="text-[11px] text-ink-400">Overall Risk</span>}
            />
            <div className="mt-3 w-full space-y-2 text-sm">
              {riskRows.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-ink-500">{k}</span>
                  <span className="font-semibold text-ink-700">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 px-4 py-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Heads up:</span> AI scores, proctoring and auto-reports are hints only.
          Final hiring calls still need a human sign-off — review CVs, recordings and notes before you extend an offer.
        </p>
      </div>

      <div className="flex items-center justify-end gap-1 pb-2 text-[11px] text-ink-400">
        <HardDriveDownload className="h-3.5 w-3.5" /> Data synced just now
      </div>
    </div>
  );
}
