"use client";

import { type LucideIcon } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatWidget } from "@/components/admin/StatWidget";

export interface StubStat {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: "accent" | "emerald" | "amber" | "rose" | "sky";
}

export interface StubCol {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
}

// placeholder screens until the backend catches up
export function StubModule({
  title,
  subtitle,
  stats,
  columns,
  rows,
  note,
  actions,
}: {
  title: string;
  subtitle?: string;
  stats?: StubStat[];
  columns?: StubCol[];
  rows?: Record<string, React.ReactNode>[];
  note?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <AdminPageHeader title={title} subtitle={subtitle} draft actions={actions} />

      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <StatWidget key={s.label} label={s.label} value={s.value} icon={s.icon} tone={s.tone} draft />
          ))}
        </div>
      )}

      {columns && rows && (
        <div className="a-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b a-border text-left text-xs uppercase tracking-wide a-faint">
                  {columns.map((c) => (
                    <th
                      key={c.key}
                      className={`px-4 py-2.5 font-medium ${c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : ""}`}
                    >
                      {c.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-b a-border/70 last:border-0">
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        className={`px-4 py-2.5 a-text ${c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : ""}`}
                      >
                        {row[c.key] ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {note && (
        <p className="rounded-xl border border-amber-400/30 bg-amber-400/5 px-4 py-3 text-xs a-muted">{note}</p>
      )}
    </div>
  );
}
