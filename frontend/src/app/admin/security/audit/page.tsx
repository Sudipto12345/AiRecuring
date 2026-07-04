"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AuditLogView } from "@/components/admin/AuditLogView";

export default function AuditLogsPage() {
  return (
    <div className="space-y-5">
      <AdminPageHeader title="Audit Logs" subtitle="System-wide record of privileged actions." />
      <AuditLogView endpoint="/admin/audit" />
    </div>
  );
}
