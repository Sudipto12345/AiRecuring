"use client";

import { StubModule } from "@/components/admin/StubModule";

export default function PromptLibraryPage() {
  return (
    <div className="p-4 lg:p-6">
      <StubModule
        title="Prompt Library"
        subtitle="Saved AI prompts for screening, summaries and outreach."
        columns={[
          { key: "name", header: "Prompt" },
          { key: "use", header: "Use case" },
        ]}
        rows={[
          { name: "Strict skill match", use: "CV scoring" },
          { name: "Concise resume summary", use: "Candidate summary" },
          { name: "Friendly outreach", use: "Email draft" },
        ]}
        note="Preview module. Saved prompts will be usable by the AI Copilot and automation actions."
      />
    </div>
  );
}
