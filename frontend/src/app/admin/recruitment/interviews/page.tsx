"use client";

import { useEffect, useState } from "react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { type Column, DataGrid } from "@/components/admin/DataGrid";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";

interface IvRow {
  id: string;
  candidate_name: string;
  company: string;
  job_title: string | null;
  status: string;
  ai_score: number | null;
  scheduled_at: string;
}

export default function GlobalInterviewsPage() {
  const [rows, setRows] = useState<IvRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<IvRow[]>("/admin/recruitment/interviews").then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  }, []);

  const tone = (s: string) => (s === "Completed" ? "green" : s === "In Progress" ? "amber" : s === "No Show" ? "rose" : "blue");

  const columns: Column<IvRow>[] = [
    { key: "candidate_name", header: "Candidate", sortValue: (r) => r.candidate_name, render: (r) => <span className="font-medium a-text">{r.candidate_name}</span> },
    { key: "company", header: "Company", sortValue: (r) => r.company, render: (r) => <span className="a-muted">{r.company}</span> },
    { key: "job_title", header: "Role", render: (r) => <span className="a-muted">{r.job_title ?? "—"}</span> },
    { key: "ai_score", header: "AI Score", align: "right", sortValue: (r) => r.ai_score ?? 0, render: (r) => <span className="tabular-nums a-text">{r.ai_score != null ? Math.round(r.ai_score) : "—"}</span> },
    { key: "status", header: "Status", sortValue: (r) => r.status, render: (r) => <Badge tone={tone(r.status)}>{r.status}</Badge> },
    { key: "scheduled_at", header: "Scheduled", align: "right", sortValue: (r) => r.scheduled_at, render: (r) => <span className="a-faint">{new Date(r.scheduled_at).toLocaleDateString()}</span> },
  ];

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Global Interviews" subtitle="All interviews across tenants (read-only)." />
      <DataGrid columns={columns} rows={rows} rowKey={(r) => r.id} loading={loading} search={(r) => `${r.candidate_name} ${r.company}`} searchPlaceholder="Search interviews…" storageKey="admin-interviews" />
    </div>
  );
}
