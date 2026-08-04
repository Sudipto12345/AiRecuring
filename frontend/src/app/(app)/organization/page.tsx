"use client";

import { Building2, ExternalLink, ShieldCheck } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAuth } from "@/lib/auth";

const overviewItems = [
  ["Workspace slug", "slug"],
  ["Status", "status"],
  ["Industry", "industry"],
  ["Workspace ID", "id"],
  ["Registration number", "registration_number"],
  ["Legal entity", "legal_entity_name"],
  ["Incorporation country", "incorporation_country"],
  ["Business address", "business_address"],
] as const;

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
          {overviewItems.map(([label, key]) => {
            const value = company?.[key] ?? "—";
            return (
              <div key={label} className="rounded-xl border a-border p-3">
                <dt className="text-xs a-faint">{label}</dt>
                <dd className="mt-0.5 truncate text-sm font-medium a-text">{value}</dd>
              </div>
            );
          })}
        </dl>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border a-border p-3">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide a-faint">
              <ShieldCheck className="h-3.5 w-3.5" /> Verification
            </div>
            <p className="text-sm font-medium a-text">{company?.verification_status ?? "verified"}</p>
            <p className="mt-1 text-xs a-faint">{company?.verification_notes ?? "Profile verification is complete."}</p>
            <p className="mt-2 text-xs a-faint">
              {company?.verified_at ? `Verified on ${new Date(company.verified_at).toLocaleDateString()}` : "Verification timestamp not set."}
            </p>
          </div>

          <div className="rounded-xl border a-border p-3">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide a-faint">
              <ExternalLink className="h-3.5 w-3.5" /> Proof document
            </div>
            {company?.proof_document_url ? (
              <a href={company.proof_document_url} target="_blank" rel="noreferrer" className="text-sm font-medium a-accent">
                Open document
              </a>
            ) : (
              <p className="text-sm a-faint">No proof document uploaded yet.</p>
            )}
          </div>
        </div>
      </div>

      <p className="flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/5 px-4 py-3 text-xs a-muted">
        <Building2 className="h-4 w-4 text-amber-500" />
        Editing company profile, branches and branding is a preview module. Core identity is shown live from your session.
      </p>
    </div>
  );
}
