"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, UserCog, Users } from "lucide-react";

import { api } from "@/lib/api";
import type { DemoAccount, Role } from "@/lib/types";

const ROLE_ICON: Record<Role, React.ReactNode> = {
  super_admin: <ShieldCheck className="h-4 w-4" />,
  company_admin: <UserCog className="h-4 w-4" />,
  hr: <Users className="h-4 w-4" />,
  interviewer: <Users className="h-4 w-4" />,
};

const PLAN_STYLE: Record<string, string> = {
  enterprise: "bg-violet-50 text-violet-700",
  pro: "bg-brand-50 text-brand-700",
  free: "bg-slate-100 text-ink-500",
};

export function DemoAccounts({
  onPick,
  busy,
}: {
  onPick: (email: string, password: string) => void;
  busy: boolean;
}) {
  const [accounts, setAccounts] = useState<DemoAccount[]>([]);

  useEffect(() => {
    api<{ accounts: DemoAccount[] }>("/system/demo-accounts", { auth: false })
      .then((res) => setAccounts(res.accounts ?? []))
      .catch(() => setAccounts([]));
  }, []);

  if (accounts.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="text-xs font-medium uppercase tracking-wide text-ink-400">
          Demo access
        </span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <div className="mt-3 grid gap-2">
        {accounts.map((a) => (
          <button
            key={a.email}
            type="button"
            disabled={busy}
            onClick={() => onPick(a.email, a.password)}
            className="group flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2.5 text-left transition hover:border-brand-300 hover:bg-brand-50/40 disabled:opacity-60"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-ink-500 group-hover:bg-white">
              {ROLE_ICON[a.role]}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-ink-800">{a.label}</span>
              <span className="block truncate text-xs text-ink-400">{a.email}</span>
            </span>
            {a.plan ? (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  PLAN_STYLE[a.plan] ?? "bg-slate-100 text-ink-500"
                }`}
              >
                {a.plan}
              </span>
            ) : (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-700">
                platform
              </span>
            )}
          </button>
        ))}
      </div>
      <p className="mt-2 text-center text-[11px] text-ink-400">
        One-click sign in · password <code className="rounded bg-slate-100 px-1">demo12345</code>
      </p>
    </div>
  );
}
