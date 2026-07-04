"use client";

import { useEffect, useState } from "react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";

interface InfoData {
  version: string;
  python: string;
  platform: string;
  env: Record<string, string | boolean>;
}

export default function EnvironmentPage() {
  const [d, setD] = useState<InfoData | null>(null);
  useEffect(() => {
    api<InfoData>("/admin/system/info").then(setD).catch(() => setD(null));
  }, []);

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Environment" subtitle="Runtime configuration (secrets redacted)." />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="a-card p-5">
          <p className="mb-3 text-sm font-semibold a-text">Runtime</p>
          <dl className="space-y-2 text-sm">
            <Row k="App version" v={d?.version} />
            <Row k="Python" v={d?.python} />
            <Row k="Platform" v={d?.platform} />
          </dl>
        </div>
        <div className="a-card p-5">
          <p className="mb-3 text-sm font-semibold a-text">Configuration</p>
          <dl className="space-y-2 text-sm">
            {d &&
              Object.entries(d.env).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3">
                  <dt className="a-faint">{k}</dt>
                  <dd className="truncate a-text">
                    {typeof v === "boolean" ? <Badge tone={v ? "green" : "slate"}>{v ? "yes" : "no"}</Badge> : String(v)}
                  </dd>
                </div>
              ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="a-faint">{k}</dt>
      <dd className="truncate a-text">{v ?? "—"}</dd>
    </div>
  );
}
