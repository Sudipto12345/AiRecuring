"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ServicesGrid } from "@/components/admin/ServicesGrid";

export default function ServicesPage() {
  return (
    <div className="space-y-5">
      <AdminPageHeader title="Services" subtitle="Status of every platform dependency." />
      <ServicesGrid />
    </div>
  );
}
