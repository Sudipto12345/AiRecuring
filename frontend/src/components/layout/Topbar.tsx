"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Menu, HelpCircle, Bell } from "lucide-react";

import { useTheme } from "@/lib/theme";
import { ProfileDropdown } from "@/components/ui/ProfileDropdown";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { CreditBadge } from "@/components/layout/CreditBadge";
import { useAuth } from "@/lib/auth";
import { PLAN_LABELS } from "@/lib/nav";

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function today() {
  const d = new Date();
  return {
    date: d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    weekday: d.toLocaleDateString("en-US", { weekday: "long" }),
  };
}

/** Return tailwind colour tokens for each plan */
function planStyle(plan?: string) {
  switch (plan) {
    case "pro":
      return {
        bg: "bg-violet-100 dark:bg-violet-900/40",
        text: "text-violet-700 dark:text-violet-300",
        dot: "bg-violet-500",
      };
    case "enterprise":
      return {
        bg: "bg-amber-100 dark:bg-amber-900/40",
        text: "text-amber-700 dark:text-amber-300",
        dot: "bg-amber-500",
      };
    default:
      return {
        bg: "bg-slate-100 dark:bg-slate-800",
        text: "text-slate-600 dark:text-slate-300",
        dot: "bg-slate-400",
      };
  }
}

/** Gradient background for the avatar initials — keyed by first char */
function avatarGradient(name: string) {
  const gradients = [
    "from-violet-500 to-indigo-600",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
    "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-600",
    "from-fuchsia-500 to-purple-600",
  ];
  const idx = (name.charCodeAt(0) || 0) % gradients.length;
  return gradients[idx];
}

/* ─── component ───────────────────────────────────────────────────────────── */

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { session, logout } = useAuth();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [now, setNow] = useState<{ date: string; weekday: string } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  /* hydrate date client-side to avoid SSR mismatch */
  useEffect(() => {
    setNow(today());
  }, []);

  /* close dropdown on outside click */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  /* Cmd+K / Ctrl+K -> focus search */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        (
          document.getElementById("topbar-search") as HTMLInputElement | null
        )?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const plan = session?.subscription?.plan;
  const ps = planStyle(plan);
  const companyName = session?.company?.name ?? "Platform";

  return (
    <header
      className={[
        "sticky top-0 z-40 flex h-14 items-center gap-3 px-4 lg:px-6",
        "border-b border-slate-200/80 dark:border-white/[0.06]",
        "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl",
        "transition-shadow duration-200",
      ].join(" ")}
    >
      {/* Mobile hamburger */}
      <button
        onClick={onMenu}
        aria-label="Open menu"
        className={[
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg lg:hidden",
          "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/[0.06]",
          "transition-colors duration-150",
        ].join(" ")}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search bar */}
      <div className="relative hidden flex-1 max-w-md md:block">
        {/* Glow ring on focus */}
        <div
          className={[
            "absolute inset-0 rounded-xl transition-all duration-200",
            searchFocused
              ? "shadow-[0_0_0_3px_rgba(99,102,241,0.15)]"
              : "shadow-none",
          ].join(" ")}
          aria-hidden
        />

        <Search
          className={[
            "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2",
            "transition-colors duration-150",
            searchFocused
              ? "text-indigo-500"
              : "text-slate-400 dark:text-slate-500",
          ].join(" ")}
        />

        <input
          id="topbar-search"
          type="search"
          placeholder="Search candidates, jobs, skills..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className={[
            "h-9 w-full rounded-xl border pl-9 pr-16 text-sm outline-none",
            "bg-slate-50 dark:bg-white/[0.04]",
            "placeholder:text-slate-400 dark:placeholder:text-slate-500",
            "text-slate-800 dark:text-slate-100",
            searchFocused
              ? "border-indigo-400 dark:border-indigo-500 bg-white dark:bg-white/[0.08]"
              : "border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.12]",
            "transition-all duration-200",
          ].join(" ")}
        />

        {/* Keyboard shortcut badge */}
        <span
          className={[
            "pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2",
            "flex items-center gap-0.5 rounded-md border px-1.5 py-0.5",
            "text-[10px] font-medium tracking-wide leading-none select-none",
            searchFocused
              ? "border-indigo-200 bg-indigo-50 text-indigo-400 dark:border-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-400"
              : "border-slate-200 bg-white text-slate-400 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-500",
            "transition-colors duration-150",
          ].join(" ")}
        >
          <span className="text-[9px]">&#8984;</span>K
        </span>
      </div>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-2">
        {/* Plan pill */}
        {plan && (
          <span
            className={[
              "hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold sm:flex",
              ps.bg,
              ps.text,
            ].join(" ")}
          >
            <span
              className={["h-1.5 w-1.5 rounded-full", ps.dot].join(" ")}
              aria-hidden
            />
            {PLAN_LABELS[plan] ?? plan}
          </span>
        )}

        {/* Credit badge */}
        <CreditBadge />

        <NotificationBell />
        <ProfileDropdown />
      </div>
    </header>
  );
}
