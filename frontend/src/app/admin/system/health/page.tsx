"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ServicesGrid } from "@/components/admin/ServicesGrid";

export default function HealthPage() {
  return (
    <div className="space-y-5">
      <AdminPageHeader title="Health" subtitle="Real-time health of core services." />
      <ServicesGrid />
    </div>
  );
}
