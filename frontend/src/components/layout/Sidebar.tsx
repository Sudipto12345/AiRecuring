"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";


import { Logo } from "@/components/layout/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/lib/auth";
import { NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { session, hasModule } = useAuth();

  return (
    <div
      className={cn(
        "flex h-full w-[260px] flex-col",
        "bg-white/95 backdrop-blur-xl",
        "border-r border-slate-200/80",
        "shadow-[1px_0_20px_0_rgba(0,0,0,0.04)]",
        "animate-in slide-in-from-left-full duration-300 ease-out",
        "dark:bg-slate-950/95 dark:border-slate-800/80",
      )}
    >
      {/* ── Logo section ── */}
      <div className="relative flex items-center gap-3 px-5 py-5 pb-4">
        <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-violet-500 via-blue-500 to-cyan-400 opacity-90" />
        <Logo />
      </div>

      {/* ── Divider ── */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />

      {/* ── Scrollable nav area ── */}
      <div className="relative flex-1 overflow-hidden">
        <nav
          className={cn(
            "h-full overflow-y-auto px-3 pt-3 pb-2",
            "[&::-webkit-scrollbar]:w-1",
            "[&::-webkit-scrollbar-track]:bg-transparent",
            "[&::-webkit-scrollbar-thumb]:rounded-full",
            "[&::-webkit-scrollbar-thumb]:bg-slate-200",
            "dark:[&::-webkit-scrollbar-thumb]:bg-slate-700",
          )}
        >
          {NAV.map((section, i) => {
            const visible = section.items.filter(
              (it) => !it.module || hasModule(it.module),
            );
            if (!visible.length) return null;

            return (
              <div key={i} className={cn(i > 0 && "mt-6")}>
                {section.heading && (
                  <div className="mb-2 flex items-center gap-2 px-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                      {section.heading}
                    </span>
                    <span className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-700" />
                  </div>
                )}

                <ul className="space-y-0.5">
                  {visible.map((item) => {
                    const active =
                      pathname === item.href ||
                      pathname.startsWith(item.href + "/");
                    const Icon = item.icon;

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onNavigate}
                          className={cn(
                            "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                            "transition-all duration-200 ease-out",
                            active
                              ? [
                                  "bg-gradient-to-r from-violet-600 via-blue-600 to-blue-500",
                                  "text-white shadow-md shadow-blue-500/20",
                                  "dark:from-violet-500 dark:via-blue-500 dark:to-cyan-500",
                                ]
                              : [
                                  "text-slate-600 dark:text-slate-400",
                                  "hover:bg-slate-100/80 hover:text-slate-900",
                                  "dark:hover:bg-slate-800/60 dark:hover:text-slate-100",
                                ],
                          )}
                        >
                          {active && (
                            <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/20 via-blue-600/20 to-blue-500/20 blur-sm -z-10" />
                          )}

                          <Icon
                            className={cn(
                              "h-[18px] w-[18px] shrink-0 transition-all duration-200",
                              active
                                ? "text-white"
                                : "text-slate-400 group-hover:text-slate-600 group-hover:scale-110 dark:text-slate-500 dark:group-hover:text-slate-300",
                            )}
                          />

                          <span className="truncate">{item.label}</span>

                          {active && (
                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/70" />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}

          <div className="h-6" />
        </nav>

        {/* Scroll-fade gradient overlay */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white/95 to-transparent dark:from-slate-950/95" />
      </div>

      {/* ── Bottom section ── */}
      <div className="space-y-2.5 px-3 pb-4 pt-2">

        {/* Keyboard shortcut hint */}
        <div className="flex items-center justify-center gap-1.5 py-0.5">
          <kbd className="inline-flex h-5 items-center gap-0.5 rounded border border-slate-200 bg-slate-50 px-1.5 font-mono text-[10px] text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
            ⌘K
          </kbd>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            to search
          </span>
        </div>

        {/* ── User card ── */}
        <div
          className={cn(
            "group flex cursor-pointer items-center gap-2.5 rounded-xl p-2",
            "border border-slate-200/80 dark:border-slate-700/80",
            "bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/60 dark:to-slate-900/60",
            "shadow-sm transition-all duration-200",
            "hover:border-slate-300 hover:shadow-md hover:from-violet-50/60 hover:to-blue-50/60",
            "dark:hover:border-slate-600 dark:hover:from-violet-900/20 dark:hover:to-blue-900/20",
          )}
        >
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 blur-[4px] opacity-30 group-hover:opacity-50 transition-opacity duration-200" />
            <div className="relative">
              <Avatar
                name={session?.user.name ?? "User"}
                src={session?.user.avatar_url}
                size="sm"
              />
            </div>
          </div>

          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[13px] font-semibold text-slate-800 dark:text-slate-100">
              {session?.user.name ?? "User"}
            </p>
            <p className="truncate text-[10px] text-slate-400 dark:text-slate-500">
              {session?.user.title ?? "Member"}
            </p>
          </div>

          <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-slate-500 dark:text-slate-600 dark:group-hover:text-slate-400" />
        </div>
      </div>
    </div>
  );
}
