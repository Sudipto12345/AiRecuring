"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Calendar, ChevronDown, LogOut, Menu, Search } from "lucide-react";

import { Avatar } from "@/components/ui/Avatar";
import { CreditBadge } from "@/components/layout/CreditBadge";
import { useAuth } from "@/lib/auth";
import { PLAN_LABELS } from "@/lib/nav";

function today() {
  const d = new Date();
  return {
    date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }),
    weekday: d.toLocaleDateString("en-US", { weekday: "long" }),
  };
}

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { session, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [now, setNow] = useState<{ date: string; weekday: string } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNow(today());
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const plan = session?.subscription?.plan;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur lg:px-6">
      <button onClick={onMenu} className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 hover:bg-slate-100 lg:hidden">
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative hidden flex-1 max-w-xl md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          placeholder="Search candidates, jobs, skills..."
          className="h-10 w-full rounded-xl border border-line bg-slate-50 pl-9 pr-3 text-sm text-ink-700 placeholder:text-ink-400 outline-none focus:border-brand-300 focus:bg-white"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 lg:gap-3">
        <div className="hidden items-center gap-2 rounded-xl border border-line px-3 py-1.5 sm:flex">
          <Calendar className="h-4 w-4 text-brand-500" />
          <div className="leading-tight">
            <p className="text-xs font-semibold text-ink-900">{now?.date ?? "—"}</p>
            <p className="text-[10px] text-ink-400">{now?.weekday ?? ""}</p>
          </div>
        </div>

        <CreditBadge />

        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-line text-ink-500 hover:bg-slate-50">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        <div ref={ref} className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-xl border border-line py-1.5 pl-2 pr-2.5 hover:bg-slate-50"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900 text-[11px] font-bold text-white">
              {(session?.company?.name ?? "AI").slice(0, 2).toUpperCase()}
            </span>
            <div className="hidden text-left leading-tight sm:block">
              <p className="max-w-[140px] truncate text-[13px] font-semibold text-ink-900">
                {session?.company?.name ?? "Platform"}
              </p>
              <p className="text-[10px] text-ink-400">
                {plan ? `${PLAN_LABELS[plan] ?? plan} plan` : "Organization"}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-ink-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-white shadow-pop">
              <div className="flex items-center gap-3 border-b border-line p-3">
                <Avatar name={session?.user.name ?? "User"} src={session?.user.avatar_url} size="sm" />
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-sm font-semibold text-ink-900">{session?.user.name}</p>
                  <p className="truncate text-xs text-ink-400">{session?.user.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
