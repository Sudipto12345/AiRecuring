"use client";

import { StubModule } from "@/components/admin/StubModule";

export default function PaymentsPage() {
  return (
    <div className="p-4 lg:p-6">
      <StubModule
        title="Payments"
        subtitle="Payment methods and billing contacts."
        columns={[
          { key: "method", header: "Method" },
          { key: "detail", header: "Detail" },
          { key: "status", header: "Status" },
        ]}
        rows={[{ method: "Managed by platform", detail: "Plans assigned by administrator", status: "Active" }]}
        note="Preview module. Self-serve payment methods will be available when online billing is enabled."
      />
    </div>
  );
}
