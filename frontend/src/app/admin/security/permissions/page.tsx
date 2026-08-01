"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { api } from "@/lib/api";

interface RoleInfo {
  key: string;
  label: string;
  permissions: string[];
}

export default function PermissionsPage() {
  const [roles, setRoles] = useState<RoleInfo[]>([]);
  useEffect(() => {
    api<RoleInfo[]>("/admin/roles").then(setRoles).catch(() => setRoles([]));
  }, []);

  const allPerms = Array.from(new Set(roles.flatMap((r) => r.permissions))).sort();

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Permissions" subtitle="Permission matrix across roles." />
      <div className="a-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b a-border text-left text-xs uppercase tracking-wide a-faint">
              <th className="px-4 py-2.5 font-medium">Permission</th>
              {roles.map((r) => (
                <th key={r.key} className="px-4 py-2.5 text-center font-medium">{r.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allPerms.map((p) => (
              <tr key={p} className="border-b a-border/70 last:border-0">
                <td className="px-4 py-2.5 a-text">{p}</td>
                {roles.map((r) => (
                  <td key={r.key} className="px-4 py-2.5 text-center">
                    {r.permissions.includes(p) ? <Check className="mx-auto h-4 w-4 text-emerald-500" /> : <span className="a-faint">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
