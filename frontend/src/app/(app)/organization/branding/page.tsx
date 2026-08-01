"use client";

import { StubModule } from "@/components/admin/StubModule";

export default function BrandingPage() {
  return (
    <div className="p-4 lg:p-6">
      <StubModule
        title="Branding"
        subtitle="Logo, colors and email branding for candidate-facing surfaces."
        note="Preview module. Upload your logo and set brand colors to apply across the career portal and emails."
      />
    </div>
  );
}
