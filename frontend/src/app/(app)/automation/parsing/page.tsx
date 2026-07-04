"use client";

import { StubModule } from "@/components/admin/StubModule";

export default function ParsingRulesPage() {
  return (
    <div className="p-4 lg:p-6">
      <StubModule
        title="Resume Parsing Rules"
        subtitle="Tune how resumes are parsed and which fields are extracted."
        columns={[
          { key: "field", header: "Field" },
          { key: "method", header: "Method" },
          { key: "status", header: "Status" },
        ]}
        rows={[
          { field: "Name / contact", method: "Heuristic + LLM", status: "Enabled" },
          { field: "Skills", method: "Keyword + LLM", status: "Enabled" },
          { field: "Experience years", method: "LLM", status: "Enabled" },
          { field: "Education", method: "LLM", status: "Enabled" },
        ]}
        note="Preview module. Parsing today uses the resume parser plus optional LLM extraction; configurable rules will live here."
      />
    </div>
  );
}
