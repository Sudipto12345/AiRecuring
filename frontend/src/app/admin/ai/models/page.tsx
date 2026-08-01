"use client";

import { Badge } from "@/components/ui/Badge";
import { StubModule } from "@/components/admin/StubModule";

export default function AiModelsPage() {
  return (
    <StubModule
      title="AI Models"
      subtitle="Model registry, defaults, and fallback chain."
      stats={[
        { label: "Registered", value: 8 },
        { label: "Enabled", value: 5 },
        { label: "Fallbacks", value: 2 },
        { label: "Avg latency", value: "1.2s" },
      ]}
      columns={[
        { key: "model", header: "Model" },
        { key: "provider", header: "Provider" },
        { key: "use", header: "Use" },
        { key: "status", header: "Status" },
      ]}
      rows={[
        { model: "gpt-4o-mini", provider: "OpenAI", use: "CV parsing / scoring", status: <Badge tone="green">default</Badge> },
        { model: "gpt-4o", provider: "OpenAI", use: "Complex ranking", status: <Badge tone="blue">enabled</Badge> },
        { model: "llama3.1:8b", provider: "Ollama", use: "Local fallback", status: <Badge tone="slate">standby</Badge> },
        { model: "text-embedding-3-small", provider: "OpenAI", use: "Embeddings", status: <Badge tone="green">default</Badge> },
      ]}
      note="Per-task model selection and fallback ordering become editable when multi-provider routing is enabled."
    />
  );
}
