"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { EngineStatus } from "@/components/layout/EngineStatus";
import { Logo } from "@/components/layout/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/lib/auth";
import { NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { session, hasModule } = useAuth();

  return (
    <div className="flex h-full w-[252px] flex-col border-r border-line bg-white">
      <div className="px-5 py-5">
        <Logo />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {NAV.map((section, i) => {
          const visible = section.items.filter((it) => !it.module || hasModule(it.module));
          if (!visible.length) return null;
          return (
            <div key={i} className={cn(i > 0 && "mt-5")}>
              {section.heading && (
                <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
                  {section.heading}
                </p>
              )}
              <ul className="space-y-0.5">
                {visible.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                          "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          active
                            ? "border-l-[3px] border-brand-600 bg-brand-50 pl-2.5 text-brand-700"
                            : "text-ink-500 hover:bg-slate-50 hover:text-ink-900",
                        )}
                      >
                        <Icon className={cn("h-[18px] w-[18px]", active ? "text-brand-600" : "text-ink-400 group-hover:text-ink-600")} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="space-y-3 px-3 pb-4">
        <EngineStatus />
        <div className="flex items-center gap-2.5 rounded-xl border border-line p-2">
          <Avatar name={session?.user.name ?? "User"} src={session?.user.avatar_url} size="sm" />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[13px] font-semibold text-ink-900">{session?.user.name}</p>
            <p className="truncate text-[11px] text-ink-400">{session?.user.title ?? "Member"}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-ink-400" />
        </div>
      </div>
    </div>
  );
}
