"use client";

import { useState } from "react";
import { Copy, KeyRound, Plus, Trash2 } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PreviewChip } from "@/components/admin/PreviewChip";
import { Badge } from "@/components/ui/Badge";

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  created: string;
  lastUsed: string;
}

function randKey() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let s = "";
  for (let i = 0; i < 32; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([
    { id: "k1", name: "Production server", prefix: "air_live_8f2a…", created: "Jun 12", lastUsed: "2m ago" },
    { id: "k2", name: "CI pipeline", prefix: "air_live_1c90…", created: "May 28", lastUsed: "1d ago" },
  ]);
  const [reveal, setReveal] = useState<string | null>(null);

  function generate() {
    const name = window.prompt("Name this API key", "New integration");
    if (!name) return;
    const full = `air_live_${randKey()}`;
    setReveal(full);
    setKeys((k) => [{ id: full.slice(-6), name, prefix: `${full.slice(0, 13)}…`, created: "just now", lastUsed: "never" }, ...k]);
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="API Keys"
        subtitle="Programmatic access tokens for the platform API."
        actions={
          <button onClick={generate} className="gradient-brand flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-white">
            <Plus className="h-4 w-4" /> Generate key
          </button>
        }
      />

      {reveal && (
        <div className="a-card flex items-center justify-between gap-3 border-emerald-500/40 bg-emerald-500/5 p-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-emerald-500">Copy this key now — it won't be shown again.</p>
            <code className="block truncate text-sm a-text">{reveal}</code>
          </div>
          <button onClick={() => navigator.clipboard?.writeText(reveal)} className="a-hover flex items-center gap-1.5 rounded-lg border a-border px-3 py-1.5 text-sm a-text">
            <Copy className="h-4 w-4" /> Copy
          </button>
        </div>
      )}

      <div className="a-card overflow-hidden">
        <div className="flex items-center gap-2 border-b a-border px-4 py-3">
          <h3 className="text-sm font-semibold a-text">Active keys</h3>
          <PreviewChip />
        </div>
        <table className="w-full text-sm">
          <tbody className="a-divide">
            {keys.map((k) => (
              <tr key={k.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <KeyRound className="h-4 w-4 a-faint" />
                    <div>
                      <p className="font-medium a-text">{k.name}</p>
                      <code className="text-xs a-faint">{k.prefix}</code>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm a-muted">Created {k.created}</td>
                <td className="px-4 py-3 text-sm a-muted">Last used {k.lastUsed}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setKeys((cur) => cur.filter((x) => x.id !== k.id))}
                    className="a-hover inline-flex items-center gap-1 rounded-lg border a-border px-2.5 py-1 text-xs text-rose-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Revoke
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Badge tone="slate">Keys here are demo-only and not yet persisted server-side.</Badge>
    </div>
  );
}
