"use client";

import { Building2 } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAuth } from "@/lib/auth";

export default function OrganizationPage() {
  const { session } = useAuth();
  const company = session?.company;

  return (
    <div className="space-y-5 p-4 lg:p-6">
      <AdminPageHeader title="Company Profile" subtitle="Your workspace identity and details." />

      <div className="a-card p-5">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-900 text-lg font-bold text-white">
            {(company?.name ?? "AI").slice(0, 2).toUpperCase()}
          </span>
          <div>
            <h3 className="text-lg font-semibold a-text">{company?.name ?? "Workspace"}</h3>
            <p className="text-sm a-faint">{company?.industry ?? "Industry not set"}</p>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            ["Workspace slug", company?.slug ?? "—"],
            ["Status", company?.status ?? "active"],
            ["Industry", company?.industry ?? "—"],
            ["Workspace ID", company?.id ?? "—"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border a-border p-3">
              <dt className="text-xs a-faint">{k}</dt>
              <dd className="mt-0.5 truncate text-sm font-medium a-text">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <p className="flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/5 px-4 py-3 text-xs a-muted">
        <Building2 className="h-4 w-4 text-amber-500" />
        Editing company profile, branches and branding is a preview module. Core identity is shown live from your session.
      </p>
    </div>
  );
}
