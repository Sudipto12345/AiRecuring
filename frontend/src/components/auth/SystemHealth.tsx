"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, RefreshCw } from "lucide-react";

import { api } from "@/lib/api";
import type { SystemHealth as SystemHealthData } from "@/lib/types";

export function SystemHealth() {
  const [data, setData] = useState<SystemHealthData | null>(null);
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  const probe = useCallback(async () => {
    setChecking(true);
    try {
      const res = await api<SystemHealthData>("/system/health", { auth: false });
      setData(res);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    probe();
    const id = setInterval(probe, 5000);
    return () => clearInterval(id);
  }, [probe]);

  return (
    <div className="rounded-xl border border-line bg-white/60 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink-700">
          <Activity className="h-4 w-4 text-brand-600" />
          System status
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-500">
            dev
          </span>
        </div>
        <button
          onClick={probe}
          className="flex items-center gap-1 text-xs text-ink-400 hover:text-ink-700"
          title="Refresh"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${checking ? "animate-spin" : ""}`} />
        </button>
      </div>

      {error && !data ? (
        <p className="mt-3 text-xs text-rose-600">
          Backend unreachable — check the API server on the configured host.
        </p>
      ) : (
        <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
          {(data?.services ?? []).map((s) => (
            <li key={s.key} className="flex items-center gap-2" title={s.detail}>
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  s.ok ? "bg-emerald-500" : "bg-rose-500"
                } ${s.ok ? "shadow-[0_0_0_3px_rgba(16,185,129,0.15)]" : ""}`}
              />
              <span className="truncate text-xs text-ink-600">{s.label}</span>
            </li>
          ))}
        </ul>
      )}

      {data?.checked_at && (
        <p className="mt-3 text-[10px] text-ink-400">
          Live · updated {new Date(data.checked_at).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
