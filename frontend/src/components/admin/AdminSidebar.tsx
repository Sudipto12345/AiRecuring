"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, X } from "lucide-react";

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
  // exact dashboard only
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
    <div className="a-surface flex h-full w-[260px] flex-col border-r a-border">
      <div className="flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="rounded-md bg-[var(--admin-accent-soft)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider a-accent">
            OS
          </span>
        </div>
        {onNavigate && (
          <button onClick={onNavigate} className="a-hover rounded-lg p-1.5 a-muted lg:hidden" aria-label="Close sidebar">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-6">
        <Link
          href={ADMIN_DASHBOARD.href}
          onClick={onNavigate}
          className={cn(
            "mb-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
            active === "/admin" ? "bg-[var(--admin-accent-soft)] a-accent" : "a-muted a-hover",
          )}
        >
          <DashIcon className="h-[18px] w-[18px]" />
          {ADMIN_DASHBOARD.label}
        </Link>

        {ADMIN_NAV.map((group) => {
          const GroupIcon = group.icon;
          const isOpen = open[group.id];
          const hasActive = group.items.some((it) => active === it.href);
          return (
            <div key={group.id} className="mb-0.5">
              <button
                onClick={() => toggle(group.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide",
                  hasActive ? "a-accent" : "a-faint a-hover",
                )}
              >
                <GroupIcon className="h-4 w-4" />
                <span className="flex-1 text-left">{group.label}</span>
                <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-90")} />
              </button>
              {isOpen && (
                <ul className="mb-1 ml-3 border-l a-border pl-2">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = active === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onNavigate}
                          className={cn(
                            "group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px]",
                            isActive ? "bg-[var(--admin-accent-soft)] a-accent font-medium" : "a-muted a-hover",
                          )}
                        >
                          <Icon className="h-[15px] w-[15px] opacity-80" />
                          <span className="flex-1">{item.label}</span>
                          {!item.real && (
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400/80" title="Mock data" />
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
    </div>
  );
}
