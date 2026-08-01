"use client";

import { useEffect, useState } from "react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { type Column, DataGrid } from "@/components/admin/DataGrid";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";

interface QRow {
  id: string;
  text: string;
  company: string;
  category: string | null;
  difficulty: string;
  created_at: string;
}

export default function QuestionBankPage() {
  const [rows, setRows] = useState<QRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<QRow[]>("/admin/recruitment/questions").then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  }, []);

  const tone = (d: string) => (d === "easy" ? "green" : d === "hard" ? "rose" : "amber");

  const columns: Column<QRow>[] = [
    { key: "text", header: "Question", sortValue: (r) => r.text, render: (r) => <span className="a-text line-clamp-1 max-w-md">{r.text}</span> },
    { key: "company", header: "Company", sortValue: (r) => r.company, render: (r) => <span className="a-muted">{r.company}</span> },
    { key: "category", header: "Category", render: (r) => <span className="a-muted">{r.category ?? "—"}</span> },
    { key: "difficulty", header: "Difficulty", sortValue: (r) => r.difficulty, render: (r) => <Badge tone={tone(r.difficulty)}>{r.difficulty}</Badge> },
  ];

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Question Bank" subtitle="All exam questions across tenants (read-only)." />
      <DataGrid columns={columns} rows={rows} rowKey={(r) => r.id} loading={loading} search={(r) => `${r.text} ${r.company} ${r.category ?? ""}`} searchPlaceholder="Search questions…" storageKey="admin-questions" />
    </div>
  );
}
