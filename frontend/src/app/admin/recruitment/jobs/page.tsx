"use client";

import { useEffect, useState } from "react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { type Column, DataGrid } from "@/components/admin/DataGrid";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";

interface JobRow {
  id: string;
  title: string;
  company: string;
  status: string;
  location: string | null;
  created_at: string;
}

export default function GlobalJobsPage() {
  const [rows, setRows] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<JobRow[]>("/admin/recruitment/jobs").then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  }, []);

  const columns: Column<JobRow>[] = [
    { key: "title", header: "Job", sortValue: (r) => r.title, render: (r) => <span className="font-medium a-text">{r.title}</span> },
    { key: "company", header: "Company", sortValue: (r) => r.company, render: (r) => <span className="a-muted">{r.company}</span> },
    { key: "location", header: "Location", render: (r) => <span className="a-muted">{r.location ?? "—"}</span> },
    { key: "status", header: "Status", sortValue: (r) => r.status, render: (r) => <Badge tone={r.status === "active" ? "green" : "slate"}>{r.status}</Badge> },
    { key: "created_at", header: "Posted", align: "right", sortValue: (r) => r.created_at, render: (r) => <span className="a-faint">{new Date(r.created_at).toLocaleDateString()}</span> },
  ];

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Global Jobs" subtitle="Every job posting across all tenants (read-only)." />
      <DataGrid columns={columns} rows={rows} rowKey={(r) => r.id} loading={loading} search={(r) => `${r.title} ${r.company}`} searchPlaceholder="Search jobs…" storageKey="admin-jobs" />
    </div>
  );
}
