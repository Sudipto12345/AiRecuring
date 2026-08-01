"use client";

import { BarChart3, FileDown, Star, Video } from "lucide-react";

import { StubModule } from "@/components/admin/StubModule";

export default function InterviewReportsPage() {
  return (
    <div className="p-4 lg:p-6">
      <StubModule
        title="Interview Reports"
        subtitle="Per-interview AI scorecards, transcripts and integrity summaries."
        stats={[
          { label: "Reports generated", value: 142, icon: FileDown, tone: "accent" },
          { label: "Avg AI score", value: "78.4", icon: Star, tone: "emerald" },
          { label: "Interviews", value: 168, icon: Video, tone: "sky" },
          { label: "Flagged integrity", value: 9, icon: BarChart3, tone: "rose" },
        ]}
        columns={[
          { key: "candidate", header: "Candidate" },
          { key: "role", header: "Role" },
          { key: "score", header: "AI score", align: "right" },
          { key: "recommend", header: "Recommendation" },
        ]}
        rows={[
          { candidate: "Md. Rafiq Hasan", role: "Senior Full Stack Developer", score: "94", recommend: "Strong hire" },
          { candidate: "Sadia Islam", role: "UI/UX Designer", score: "88", recommend: "Hire" },
          { candidate: "Rakib Ahmed", role: "Backend Developer", score: "72", recommend: "Maybe" },
        ]}
        note="Preview module. Detailed interview reports (transcript, emotion, voice and face analysis, question timeline) will appear here once report exports are enabled."
      />
    </div>
  );
}
