"use client";

import { Eye, Globe, Send, Share2 } from "lucide-react";

import { StubModule } from "@/components/admin/StubModule";

export default function CareerPortalPage() {
  return (
    <div className="p-4 lg:p-6">
      <StubModule
        title="Career Portal"
        subtitle="Your public, branded careers site with application forms and referrals."
        stats={[
          { label: "Page views (30d)", value: "12.4k", icon: Eye, tone: "accent" },
          { label: "Applications", value: 386, icon: Send, tone: "emerald" },
          { label: "Referrals", value: 54, icon: Share2, tone: "amber" },
          { label: "Published jobs", value: 9, icon: Globe, tone: "sky" },
        ]}
        columns={[
          { key: "job", header: "Public job" },
          { key: "views", header: "Views", align: "right" },
          { key: "apps", header: "Applications", align: "right" },
          { key: "status", header: "Status" },
        ]}
        rows={[
          { job: "Senior Full Stack Developer", views: "3,210", apps: "112", status: "Live" },
          { job: "Product Manager", views: "1,890", apps: "74", status: "Live" },
          { job: "UI/UX Designer", views: "2,140", apps: "96", status: "Live" },
          { job: "DevOps Engineer", views: "980", apps: "41", status: "Draft" },
        ]}
        note="Preview module. The career portal will let you publish branded landing pages, custom application forms, SEO settings and an employee-referral flow on your own domain."
      />
    </div>
  );
}
