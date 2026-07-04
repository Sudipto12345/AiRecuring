"use client";

import { useEffect, useMemo, useState } from "react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { api } from "@/lib/api";
import type { Interview } from "@/lib/types";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function InterviewCalendarPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [cursor, setCursor] = useState(() => new Date());

  useEffect(() => {
    api<Interview[]>("/interviews")
      .then(setInterviews)
      .catch(() => setInterviews([]));
  }, []);

  const byDay = useMemo(() => {
    const map: Record<string, Interview[]> = {};
    for (const i of interviews) {
      const d = new Date(i.scheduled_at);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      (map[key] ||= []).push(i);
    }
    return map;
  }, [interviews]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthLabel = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const today = new Date();

  return (
    <div className="space-y-5 p-4 lg:p-6">
      <AdminPageHeader
        title="Interview Calendar"
        subtitle="All scheduled interviews at a glance."
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="a-hover rounded-lg border a-border px-3 py-1.5 text-sm a-muted">
              ‹
            </button>
            <span className="min-w-[9rem] text-center text-sm font-semibold a-text">{monthLabel}</span>
            <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="a-hover rounded-lg border a-border px-3 py-1.5 text-sm a-muted">
              ›
            </button>
          </div>
        }
      />

      <div className="a-card overflow-hidden p-3">
        <div className="grid grid-cols-7 gap-px">
          {WEEKDAYS.map((d) => (
            <div key={d} className="px-2 py-1.5 text-center text-[11px] font-semibold uppercase a-faint">
              {d}
            </div>
          ))}
          {cells.map((day, idx) => {
            if (day === null) return <div key={idx} className="min-h-24 rounded-lg" />;
            const key = `${year}-${month}-${day}`;
            const list = byDay[key] ?? [];
            const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
            return (
              <div
                key={idx}
                className={cn("min-h-24 rounded-lg border a-border p-1.5", isToday && "ring-1 ring-[var(--admin-accent)]")}
              >
                <p className={cn("mb-1 text-xs font-semibold", isToday ? "a-accent" : "a-muted")}>{day}</p>
                <div className="space-y-1">
                  {list.slice(0, 3).map((i) => (
                    <div key={i.id} className="truncate rounded a-accent-soft px-1.5 py-0.5 text-[10px]" title={i.candidate_name}>
                      {i.candidate_name}
                    </div>
                  ))}
                  {list.length > 3 && <p className="text-[10px] a-faint">+{list.length - 3} more</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
