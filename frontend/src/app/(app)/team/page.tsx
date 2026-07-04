"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, UserCog, Users } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataGrid, type Column } from "@/components/admin/DataGrid";
import { StatWidget } from "@/components/admin/StatWidget";
import { Avatar } from "@/components/ui/Avatar";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Role, TeamMember } from "@/lib/types";

const ROLE_LABELS: Record<string, string> = {
  company_admin: "Company Admin",
  hr: "HR / Recruiter",
  interviewer: "Interviewer",
  super_admin: "Super Admin",
};

const ASSIGNABLE: Role[] = ["company_admin", "hr", "interviewer"];

export default function TeamPage() {
  const { session } = useAuth();
  const isAdmin = session?.user.role === "company_admin";
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    api<TeamMember[]>("/team")
      .then(setMembers)
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, []);

  async function changeRole(id: string, role: Role) {
    setSaving(id);
    try {
      const updated = await api<TeamMember>(`/team/${id}/role`, { method: "PATCH", body: { role } });
      setMembers((m) => m.map((x) => (x.id === id ? updated : x)));
    } catch {
      /* fail soft */
    } finally {
      setSaving(null);
    }
  }

  const columns: Column<TeamMember>[] = [
    {
      key: "name",
      header: "Member",
      sortValue: (r) => r.name,
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.name} src={r.avatar_url ?? undefined} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium a-text">{r.name}</p>
            <p className="truncate text-xs a-faint">{r.email}</p>
          </div>
        </div>
      ),
    },
    { key: "title", header: "Title", render: (r) => r.title ?? "—" },
    {
      key: "role",
      header: "Role",
      sortValue: (r) => r.role,
      render: (r) =>
        isAdmin && r.role !== "super_admin" ? (
          <select
            value={r.role}
            disabled={saving === r.id}
            onChange={(e) => changeRole(r.id, e.target.value as Role)}
            onClick={(e) => e.stopPropagation()}
            className="a-input h-8 px-2 text-xs"
          >
            {ASSIGNABLE.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        ) : (
          <span className="rounded-full a-accent-soft px-2 py-0.5 text-xs">{ROLE_LABELS[r.role] ?? r.role}</span>
        ),
    },
    {
      key: "created_at",
      header: "Joined",
      sortValue: (r) => r.created_at,
      align: "right",
      render: (r) => new Date(r.created_at).toLocaleDateString(),
    },
  ];

  const admins = members.filter((m) => m.role === "company_admin").length;
  const recruiters = members.filter((m) => m.role === "hr").length;

  return (
    <div className="space-y-5 p-4 lg:p-6">
      <AdminPageHeader title="Team Members" subtitle="Manage who can access your workspace and their roles." />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatWidget label="Members" value={members.length} icon={Users} tone="accent" />
        <StatWidget label="Admins" value={admins} icon={ShieldCheck} tone="emerald" />
        <StatWidget label="Recruiters" value={recruiters} icon={UserCog} tone="amber" />
        <StatWidget label="Interviewers" value={members.filter((m) => m.role === "interviewer").length} icon={Users} tone="sky" />
      </div>

      <DataGrid
        columns={columns}
        rows={members}
        rowKey={(r) => r.id}
        search={(r) => `${r.name} ${r.email} ${r.role}`}
        searchPlaceholder="Search team members…"
        loading={loading}
        storageKey="company-team"
        empty="No team members yet."
      />

      {!isAdmin && (
        <p className="text-xs a-faint">Only company admins can change member roles.</p>
      )}
    </div>
  );
}
