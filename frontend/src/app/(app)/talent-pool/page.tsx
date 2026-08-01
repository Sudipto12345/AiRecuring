"use client";

import { Award, Bookmark, Sparkles, Users } from "lucide-react";

import { StubModule } from "@/components/admin/StubModule";

export default function TalentPoolPage() {
  return (
    <div className="p-4 lg:p-6">
      <StubModule
        title="Talent Pool"
        subtitle="Re-engage past applicants and silver-medalists with AI similarity matching."
        stats={[
          { label: "Saved talent", value: 248, icon: Bookmark, tone: "accent" },
          { label: "Silver medalists", value: 64, icon: Award, tone: "amber" },
          { label: "AI rediscovered", value: 31, icon: Sparkles, tone: "emerald" },
          { label: "Tagged groups", value: 12, icon: Users, tone: "sky" },
        ]}
        columns={[
          { key: "name", header: "Candidate" },
          { key: "role", header: "Last role" },
          { key: "match", header: "AI match", align: "right" },
          { key: "tag", header: "Pool" },
        ]}
        rows={[
          { name: "Nabila Karim", role: "Frontend Engineer", match: "92%", tag: "Engineering" },
          { name: "Hasan Mahmud", role: "DevOps Engineer", match: "88%", tag: "Infrastructure" },
          { name: "Priya Sharma", role: "Product Designer", match: "85%", tag: "Design" },
          { name: "Arif Chowdhury", role: "Data Analyst", match: "81%", tag: "Data" },
        ]}
        note="Preview module. Once the talent-pool service is enabled, this view will surface past candidates ranked by vector similarity to your open roles."
      />
    </div>
  );
}
