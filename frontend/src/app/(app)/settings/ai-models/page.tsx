"use client";

import { useEffect, useState } from "react";

import { StubModule } from "@/components/admin/StubModule";
import { api } from "@/lib/api";
import type { SystemHealth } from "@/lib/types";

export default function AiModelsPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);

  useEffect(() => {
    api<SystemHealth>("/system/health", { auth: false })
      .then(setHealth)
      .catch(() => {});
  }, []);

  const llm = health?.services.find((s) => s.key === "llm");
  const vector = health?.services.find((s) => s.key === "qdrant");

  return (
    <div className="p-4 lg:p-6">
      <StubModule
        title="AI Models"
        subtitle="Models powering screening, scoring and the copilot."
        columns={[
          { key: "engine", header: "Engine" },
          { key: "model", header: "Model" },
          { key: "status", header: "Status" },
        ]}
        rows={[
          { engine: "LLM (parsing, scoring, copilot)", model: llm?.detail ?? "heuristic fallback", status: llm?.ok ? "Online" : "Offline" },
          { engine: "Embeddings / vector search", model: "Qdrant", status: vector?.ok ? "Online" : "Offline" },
          { engine: "Face recognition", model: "OpenCV YuNet + SFace", status: "Local" },
        ]}
        note="Model selection is configured by the platform. This view reflects the live engine status; per-workspace overrides are a preview."
      />
    </div>
  );
}
