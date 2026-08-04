"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Shield, Sparkles, X, Zap } from "lucide-react";

import { Logo } from "@/components/layout/Logo";
import { ADMIN_COMMANDS, ADMIN_DASHBOARD, ADMIN_NAV } from "@/lib/adminNav";
import { cn } from "@/lib/utils";

function bestMatch(pathname: string): string {
  let best = "";
  for (const c of [ADMIN_DASHBOARD, ...ADMIN_COMMANDS]) {
    const href = c.href;
    if (pathname === href || pathname.startsWith(href + "/")) {
      if (href.length > best.length) best = href;
    }
  }
  if (pathname === "/admin") return "/admin";
  return best;
}

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = useMemo(() => bestMatch(pathname), [pathname]);

  const initialOpen = useMemo(() => {
    const set: Record<string, boolean> = {};
    for (const g of ADMIN_NAV) set[g.id] = g.items.some((it) => active === it.href);
    return set;
  }, [active]);

  const [open, setOpen] = useState<Record<string, boolean>>(initialOpen);
  const toggle = (id: string) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  const DashIcon = ADMIN_DASHBOARD.icon;

  return (
    <div className="a-surface a-border flex h-full w-[260px] flex-col border-r a-text select-none backdrop-blur-xl">
      {/* ── Brand Header (3D Glass Accent) ── */}
      <div className="a-border flex items-center justify-between border-b px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-md shadow-indigo-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-zinc-950">
              <Sparkles className="h-4 w-4 text-indigo-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-extrabold tracking-tight a-text">AIRecruit OS</span>
            <span className="flex items-center gap-1 text-[9px] font-semibold text-indigo-600 dark:text-indigo-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Platform Owner
            </span>
          </div>
        </div>

        {onNavigate && (
          <button
            onClick={onNavigate}
            className="a-hover rounded-lg p-1.5 a-faint hover:a-text lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Navigation Links ── */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1 no-scrollbar">
        {/* Main Dashboard Link */}
        <Link
          href={ADMIN_DASHBOARD.href}
          onClick={onNavigate}
          className={cn(
            "group relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-semibold transition-all duration-200",
            active === "/admin"
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/25"
              : "a-faint hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800/70 dark:hover:text-white"
          )}
        >
          <DashIcon className={cn("h-4 w-4 transition-transform group-hover:scale-110", active === "/admin" ? "text-white" : "a-faint")} />
          <span>{ADMIN_DASHBOARD.label}</span>
          {active === "/admin" && (
            <span className="absolute right-2.5 h-1.5 w-1.5 rounded-full bg-white animate-ping" />
          )}
        </Link>

        <div className="my-2.5 mx-2 border-t a-border opacity-40" />

        {/* Group Navigation */}
        {ADMIN_NAV.map((group) => {
          const GroupIcon = group.icon;
          const isOpen = open[group.id];
          const hasActive = group.items.some((it) => active === it.href);

          return (
            <div key={group.id} className="space-y-1">
              <button
                onClick={() => toggle(group.id)}
                className={cn(
                  "group flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-150",
                  hasActive
                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10"
                    : "a-faint hover:a-muted hover:bg-zinc-100 dark:hover:bg-zinc-800/40"
                )}
              >
                <div className="flex items-center gap-2">
                  <GroupIcon className={cn("h-3.5 w-3.5 transition-transform group-hover:scale-105", hasActive ? "text-indigo-600 dark:text-indigo-400" : "opacity-60")} />
                  <span>{group.label}</span>
                </div>
                <ChevronRight className={cn("h-3 w-3 opacity-50 transition-transform duration-200", isOpen && "rotate-90")} />
              </button>

              {isOpen && (
                <ul className="ml-3 border-l-2 border-indigo-500/20 pl-2 space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = active === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onNavigate}
                          className={cn(
                            "group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-all duration-150",
                            isActive
                              ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 font-bold border-l-2 border-indigo-500 pl-2 shadow-sm"
                              : "a-faint hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800/60 dark:hover:text-white"
                          )}
                        >
                          <Icon className={cn("h-3.5 w-3.5 transition-transform group-hover:scale-110", isActive ? "text-indigo-600 dark:text-indigo-400" : "a-faint")} />
                          <span className="flex-1 truncate">{item.label}</span>
                          {!item.real && (
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500/80" title="Preview Mode" />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── System Vitality Footer Card ── */}
      <div className="p-2.5 border-t a-border">
        <div className="rounded-xl a-surface-2 p-2.5 border a-border space-y-1.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="a-faint font-semibold uppercase tracking-wider flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-500" /> Bedrock AI
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">99.9%</span>
          </div>
          <div className="h-1 w-full rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: "99.9%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
