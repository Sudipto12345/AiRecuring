"use client";

import { Badge } from "@/components/ui/Badge";
import { StubModule } from "@/components/admin/StubModule";

export default function EmbeddingModelsPage() {
  return (
    <StubModule
      title="Embedding Models"
      subtitle="Vector embedding models and indexing configuration."
      stats={[
        { label: "Models", value: 2 },
        { label: "Default dim", value: 384 },
        { label: "Indexed docs", value: "—" },
        { label: "Chunk size", value: 512 },
      ]}
      columns={[
        { key: "model", header: "Model" },
        { key: "dim", header: "Dim", align: "right" },
        { key: "use", header: "Use" },
        { key: "status", header: "Status" },
      ]}
      rows={[
        { model: "all-MiniLM-L6-v2", dim: 384, use: "Local default", status: <Badge variant="success">active</Badge> },
        { model: "text-embedding-3-small", dim: 1536, use: "OpenAI (optional)", status: <Badge variant="default">standby</Badge> },
      ]}
      note="Live Qdrant index stats are shown on the Vector Database page; chunking config is editable once exposed."
    />
  );
}
