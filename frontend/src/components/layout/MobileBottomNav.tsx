"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Briefcase,
  LayoutDashboard,
  Users,
  Video,
} from "lucide-react";

import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Nav items — the 5 most important destinations                       */
/* ------------------------------------------------------------------ */
const ITEMS = [
  { label: "Dashboard",  href: "/dashboard",  icon: LayoutDashboard },
  { label: "Jobs",       href: "/jobs",        icon: Briefcase       },
  { label: "People",    href: "/candidates",  icon: Users           },
  { label: "Interviews", href: "/interviews",  icon: Video           },
  { label: "Reports",   href: "/reports",     icon: BarChart3       },
] as const;

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */
export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <>
      {/* ── Safe-area spacer so page content is not hidden behind the bar */}
      <div
        className="lg:hidden"
        style={{ height: "calc(4rem + env(safe-area-inset-bottom, 0px))" }}
        aria-hidden
      />

      {/* ── The bar itself ─────────────────────────────────────────────── */}
      <nav
        aria-label="Mobile navigation"
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 lg:hidden",
          // Glass surface
          "bg-white/90 backdrop-blur-xl",
          // Rounded top corners + subtle top shadow
          "rounded-t-2xl",
          "shadow-[0_-4px_24px_-4px_rgba(15,23,42,0.10),0_-1px_3px_rgba(15,23,42,0.06)]",
          // Hairline top border for definition
          "border-t border-white/60",
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-stretch">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex flex-1 flex-col items-center justify-center",
                  "h-16 select-none gap-[3px] px-1",
                  // Tap highlight suppression (iOS)
                  "[-webkit-tap-highlight-color:transparent]",
                  // Bounce on press via scale
                  "transition-transform duration-150 active:scale-90",
                )}
                aria-current={active ? "page" : undefined}
              >
                {/* ── Pill indicator above icon ───────────────────── */}
                <span
                  className={cn(
                    "absolute top-2 h-1 rounded-full transition-all duration-300 ease-out",
                    active
                      ? "w-8 opacity-100 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500"
                      : "w-0 opacity-0",
                  )}
                />

                {/* ── Icon bubble ─────────────────────────────────── */}
                <span
                  className={cn(
                    "relative flex h-8 w-8 items-center justify-center rounded-xl",
                    "transition-all duration-300 ease-out",
                    active
                      ? "bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-purple-500/10 scale-110"
                      : "scale-100",
                  )}
                >
                  <Icon
                    strokeWidth={active ? 2.25 : 1.75}
                    className={cn(
                      "h-[19px] w-[19px] transition-all duration-300",
                      active
                        ? "text-indigo-600"
                        : "text-slate-400 group-hover:text-slate-500",
                    )}
                  />
                </span>

                {/* ── Label ──────────────────────────────────────── */}
                <span
                  className={cn(
                    "text-[10px] font-semibold tracking-wide transition-all duration-300 leading-none",
                    active
                      ? "text-indigo-600"
                      : "text-slate-400 group-hover:text-slate-500",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
