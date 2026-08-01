"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PreviewChip } from "@/components/admin/PreviewChip";

export interface Series {
  key: string;
  color: string;
  label?: string;
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  draft?: boolean;
  type: "area" | "line" | "bar" | "pie";
  data: Record<string, string | number>[];
  series?: Series[];
  xKey?: string;
  height?: number;
  action?: React.ReactNode;
}

const axisStyle = { fontSize: 11, fill: "var(--admin-faint)" };

function tooltipStyle() {
  return {
    backgroundColor: "var(--admin-elevated)",
    border: "1px solid var(--admin-border)",
    borderRadius: 10,
    color: "var(--admin-text)",
    fontSize: 12,
  };
}

export function ChartCard({
  title,
  subtitle,
  draft,
  type,
  data,
  series = [],
  xKey = "label",
  height = 240,
  action,
}: ChartCardProps) {
  return (
    <div className="a-card p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold a-text">{title}</h3>
            {draft && <PreviewChip />}
          </div>
          {subtitle && <p className="mt-0.5 text-xs a-faint">{subtitle}</p>}
        </div>
        {action}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        {type === "area" ? (
          <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <defs>
              {series.map((s) => (
                <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" vertical={false} />
            <XAxis dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={40} />
            <Tooltip contentStyle={tooltipStyle()} />
            {series.map((s) => (
              <Area key={s.key} type="monotone" dataKey={s.key} stroke={s.color} fill={`url(#grad-${s.key})`} strokeWidth={2} />
            ))}
          </AreaChart>
        ) : type === "line" ? (
          <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" vertical={false} />
            <XAxis dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={40} />
            <Tooltip contentStyle={tooltipStyle()} />
            {series.map((s) => (
              <Line key={s.key} type="monotone" dataKey={s.key} stroke={s.color} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        ) : type === "bar" ? (
          <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" vertical={false} />
            <XAxis dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={40} />
            <Tooltip contentStyle={tooltipStyle()} cursor={{ fill: "var(--admin-hover)" }} />
            {series.map((s) => (
              <Bar key={s.key} dataKey={s.key} fill={s.color} radius={[6, 6, 0, 0]} />
            ))}
          </BarChart>
        ) : (
          <PieChart>
            <Tooltip contentStyle={tooltipStyle()} />
            <Pie data={data} dataKey={series[0]?.key ?? "value"} nameKey={xKey} innerRadius={55} outerRadius={85} paddingAngle={2}>
              {data.map((entry, i) => (
                <Cell key={i} fill={(entry.color as string) ?? series[0]?.color ?? "#6366f1"} />
              ))}
            </Pie>
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
