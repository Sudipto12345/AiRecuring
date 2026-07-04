"use client";

import { useEffect, useState } from "react";
import { Bot, CheckCircle2, Circle } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PreviewChip } from "@/components/admin/PreviewChip";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface Provider {
  key: string;
  label: string;
  configured: boolean;
  status: string;
  real: boolean;
}
interface ProvidersData {
  active_provider: string;
  active_model: string;
  providers: Provider[];
  models: { model: string; input_per_1k: number; output_per_1k: number }[];
  embedding_model: string;
  embedding_dim: number;
}

export default function AiProvidersPage() {
  const [data, setData] = useState<ProvidersData | null>(null);

  useEffect(() => {
    api<ProvidersData>("/admin/ai/providers").then(setData).catch(() => setData(null));
  }, []);

  return (
    <div className="space-y-5">
      <AdminPageHeader title="AI Providers" subtitle="Configured LLM and embedding providers." />

      {data && (
        <div className="a-card flex flex-wrap items-center gap-4 p-4">
          <Bot className="h-6 w-6 a-accent" />
          <div>
            <p className="text-sm font-semibold a-text">
              Active: {data.active_provider} · {data.active_model}
            </p>
            <p className="text-xs a-faint">Embeddings: {data.embedding_model} ({data.embedding_dim}d)</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.providers.map((p) => (
          <div key={p.key} className="a-card flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              {p.configured ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5 a-faint" />}
              <div>
                <p className="text-sm font-medium a-text">{p.label}</p>
                <p className="text-xs a-faint">{p.status}</p>
              </div>
            </div>
            {!p.real && <PreviewChip />}
          </div>
        ))}
      </div>

      <div className="a-card overflow-hidden">
        <div className="border-b a-border px-4 py-3">
          <h3 className="text-sm font-semibold a-text">Model pricing (USD / 1K tokens)</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b a-border text-left text-xs uppercase tracking-wide a-faint">
              <th className="px-4 py-2.5 font-medium">Model</th>
              <th className="px-4 py-2.5 text-right font-medium">Input</th>
              <th className="px-4 py-2.5 text-right font-medium">Output</th>
            </tr>
          </thead>
          <tbody>
            {data?.models.map((m) => (
              <tr key={m.model} className={cn("border-b a-border/70 last:border-0")}>
                <td className="px-4 py-2.5 a-text">{m.model}</td>
                <td className="px-4 py-2.5 text-right tabular-nums a-muted">${m.input_per_1k}</td>
                <td className="px-4 py-2.5 text-right tabular-nums a-muted">${m.output_per_1k}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
