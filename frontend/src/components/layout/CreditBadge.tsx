"use client";

import { useEffect, useRef, useState } from "react";
import { Coins, Loader2 } from "lucide-react";

import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { CreditBalance } from "@/lib/types";

export function CreditBadge() {
  const { session } = useAuth();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<CreditBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const balance = data?.balance ?? session?.credits ?? 0;
  const low = balance <= 50;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      setLoading(true);
      try {
        setData(await api<CreditBalance>("/credits"));
      } catch {
        /* wallet popup — ignore errors */
      } finally {
        setLoading(false);
      }
    }
  }

  if (!session?.company) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={toggle}
        className={`flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold ${
          low
            ? "border-amber-300 bg-amber-50 text-amber-700"
            : "border-line bg-white text-ink-900 hover:bg-slate-50"
        }`}
        title="AI credit balance"
      >
        <Coins className={`h-4 w-4 ${low ? "text-amber-500" : "text-brand-500"}`} />
        <span className="tabular-nums">{balance.toLocaleString()}</span>
        <span className="hidden text-[11px] font-medium text-ink-400 sm:inline">credits</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-line bg-white shadow-pop">
          <div className="border-b border-line p-4">
            <p className="text-xs text-ink-400">AI Credit Balance</p>
            <p className="mt-1 text-2xl font-bold text-ink-900 tabular-nums">{balance.toLocaleString()}</p>
            {data && (
              <p className="mt-1 text-[11px] text-ink-400">
                {data.lifetime_spent.toLocaleString()} spent · {data.lifetime_granted.toLocaleString()} granted
              </p>
            )}
            {low && (
              <p className="mt-2 rounded-lg bg-amber-50 px-2 py-1.5 text-[11px] text-amber-700">
                Balance is low. Ask your administrator to top up.
              </p>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-2 p-6 text-sm text-ink-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading usage…
              </div>
            ) : data && data.transactions.length > 0 ? (
              data.transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between border-b border-line px-4 py-2 last:border-0">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-ink-900">{t.reason}</p>
                    <p className="text-[10px] text-ink-400">
                      {t.model ? `${t.model} · ` : ""}
                      {new Date(t.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={`ml-2 shrink-0 text-sm font-semibold tabular-nums ${t.kind === "grant" ? "text-emerald-600" : "text-rose-600"}`}>
                    {t.kind === "grant" ? "+" : "−"}
                    {t.credits}
                  </span>
                </div>
              ))
            ) : (
              <p className="p-6 text-center text-sm text-ink-400">No usage yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
