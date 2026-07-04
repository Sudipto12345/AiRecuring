"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AuditLogView } from "@/components/admin/AuditLogView";

export default function UserActivityPage() {
  return (
    <div className="space-y-5">
      <AdminPageHeader title="User Activity" subtitle="Recent platform actions across all users." />
      <AuditLogView endpoint="/admin/users/activity" />
    </div>
  );
}
