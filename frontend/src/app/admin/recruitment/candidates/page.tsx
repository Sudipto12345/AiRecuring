"use client";

import { useEffect, useState } from "react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { type Column, DataGrid } from "@/components/admin/DataGrid";
import { StageBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { api } from "@/lib/api";

interface CandRow {
  id: string;
  name: string;
  company: string;
  job_title: string | null;
  overall_score: number;
  stage: string;
  added_on: string;
}

export default function GlobalCandidatesPage() {
  const [rows, setRows] = useState<CandRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<CandRow[]>("/admin/recruitment/candidates").then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  }, []);

  const columns: Column<CandRow>[] = [
    {
      key: "name",
      header: "Candidate",
      sortValue: (r) => r.name,
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={r.name} size="sm" />
          <div>
            <p className="font-medium a-text">{r.name}</p>
            <p className="text-xs a-faint">{r.job_title ?? "—"}</p>
          </div>
        </div>
      ),
    },
    { key: "company", header: "Company", sortValue: (r) => r.company, render: (r) => <span className="a-muted">{r.company}</span> },
    { key: "overall_score", header: "Score", align: "right", sortValue: (r) => r.overall_score, render: (r) => <span className="font-semibold tabular-nums a-text">{Math.round(r.overall_score)}</span> },
    { key: "stage", header: "Stage", sortValue: (r) => r.stage, render: (r) => <StageBadge stage={r.stage} /> },
    { key: "added_on", header: "Added", align: "right", sortValue: (r) => r.added_on, render: (r) => <span className="a-faint">{new Date(r.added_on).toLocaleDateString()}</span> },
  ];

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Global Candidates" subtitle="All candidate profiles across tenants (read-only)." />
      <DataGrid columns={columns} rows={rows} rowKey={(r) => r.id} loading={loading} search={(r) => `${r.name} ${r.company} ${r.job_title ?? ""}`} searchPlaceholder="Search candidates…" storageKey="admin-candidates" />
    </div>
  );
}
