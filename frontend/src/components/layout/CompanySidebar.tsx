"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, ChevronsUpDown, HardDrive, LogOut, Sparkles } from "lucide-react";


import { Logo } from "@/components/layout/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/lib/auth";
import { COMPANY_DASHBOARD, COMPANY_NAV } from "@/lib/companyNav";
import { PLAN_LABELS } from "@/lib/nav";
import { cn } from "@/lib/utils";

function bestMatch(pathname: string): string {
  if (pathname === "/dashboard") return "/dashboard";
  let best = "";
  for (const g of COMPANY_NAV) {
    for (const it of g.items) {
      if (pathname === it.href || pathname.startsWith(it.href + "/")) {
        if (it.href.length > best.length) best = it.href;
      }
    }
  }
  return best;
}

export function CompanySidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, hasModule, logout } = useAuth();
  const active = useMemo(() => bestMatch(pathname), [pathname]);

  const initialOpen = useMemo(() => {
    const set: Record<string, boolean> = {};
    for (const g of COMPANY_NAV) set[g.id] = g.items.some((it) => active === it.href);
    // Recruitment open by default so the panel never starts fully collapsed.
    if (!Object.values(set).some(Boolean)) set["recruitment"] = true;
    return set;
  }, [active]);

  const [open, setOpen] = useState<Record<string, boolean>>(initialOpen);
  const toggle = (id: string) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  const plan = session?.subscription?.plan;
  const storageLimit = session?.subscription?.limits?.storageGb;
  const DashIcon = COMPANY_DASHBOARD.icon;

  return (
    <div className="a-surface flex h-full w-[260px] flex-col border-r a-border">
      <div className="flex items-center gap-2 px-5 py-5">
        <Logo />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <Link
          href={COMPANY_DASHBOARD.href}
          onClick={onNavigate}
          className={cn(
            "mb-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
            active === "/dashboard" ? "a-accent-soft a-accent" : "a-muted a-hover",
          )}
        >
          <DashIcon className="h-[18px] w-[18px]" />
          {COMPANY_DASHBOARD.label}
        </Link>

        {COMPANY_NAV.map((group) => {
          const visible = group.items.filter((it) => !it.module || hasModule(it.module));
          if (!visible.length) return null;
          // The Home group's Dashboard link is rendered above; drop the dup.
          const items = group.id === "home" ? visible.filter((it) => it.href !== "/dashboard") : visible;
          if (!items.length) return null;

          const GroupIcon = group.icon;
          const isOpen = open[group.id];
          const hasActive = items.some((it) => active === it.href);
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
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = active === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onNavigate}
                          className={cn(
                            "group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px]",
                            isActive ? "a-accent-soft a-accent font-medium" : "a-muted a-hover",
                          )}
                        >
                          <Icon className="h-[15px] w-[15px] opacity-80" />
                          <span className="flex-1">{item.label}</span>
                          {!item.real && <span className="h-1.5 w-1.5 rounded-full bg-amber-400/80" title="Preview" />}
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

      <div className="space-y-2.5 border-t a-border px-3 py-3">

        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/billing"
            onClick={onNavigate}
            className="a-hover rounded-xl border a-border px-2.5 py-2"
          >
            <p className="flex items-center gap-1 text-[10px] a-faint">
              <Sparkles className="h-3 w-3" /> Plan
            </p>
            <p className="mt-0.5 truncate text-[13px] font-semibold a-text">
              {plan ? PLAN_LABELS[plan] ?? plan : "Free"}
            </p>
          </Link>
          <Link
            href="/billing/storage"
            onClick={onNavigate}
            className="a-hover rounded-xl border a-border px-2.5 py-2"
          >
            <p className="flex items-center gap-1 text-[10px] a-faint">
              <HardDrive className="h-3 w-3" /> Storage
            </p>
            <p className="mt-0.5 truncate text-[13px] font-semibold a-text">
              {storageLimit ? `${storageLimit} GB` : "—"}
            </p>
          </Link>
        </div>

        <button
          onClick={() => router.push("/organization")}
          className="a-hover flex w-full items-center gap-2.5 rounded-xl border a-border p-2 text-left"
          title="Workspace"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900 text-[11px] font-bold text-white">
            {(session?.company?.name ?? "AI").slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[13px] font-semibold a-text">{session?.company?.name ?? "Workspace"}</p>
            <p className="truncate text-[10px] a-faint">Switch workspace</p>
          </div>
          <ChevronsUpDown className="h-4 w-4 a-faint" />
        </button>

        <div className="flex items-center gap-2.5 rounded-xl border a-border p-2">
          <Avatar name={session?.user.name ?? "User"} src={session?.user.avatar_url} size="sm" />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[13px] font-semibold a-text">{session?.user.name}</p>
            <p className="truncate text-[11px] a-faint">{session?.user.title ?? session?.user.role ?? "Member"}</p>
          </div>
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            title="Sign out"
            className="a-hover rounded-lg p-1.5 a-muted"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
