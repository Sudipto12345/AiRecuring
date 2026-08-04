"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { api } from "@/lib/api";

interface RoleInfo {
  key: string;
  label: string;
  description: string;
  permissions: string[];
}

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleInfo[]>([]);
  useEffect(() => {
    api<RoleInfo[]>("/admin/roles").then(setRoles).catch(() => setRoles([]));
  }, []);

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Roles" subtitle="Built-in roles and their capabilities." />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {roles.map((r) => (
          <div key={r.key} className="a-card p-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg a-accent-soft a-accent">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold a-text">{r.label}</p>
                <p className="text-xs a-faint">{r.key}</p>
              </div>
            </div>
            <p className="mt-3 text-sm a-muted">{r.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {r.permissions.map((p) => (
                <span key={p} className="rounded-md a-surface-2 px-2 py-0.5 text-[11px] a-muted">{p}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
