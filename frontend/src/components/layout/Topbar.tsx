"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
  Zap,
} from "lucide-react";

import { Avatar } from "@/components/ui/Avatar";
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
  const initials = companyName.slice(0, 2).toUpperCase();
  const gradient = avatarGradient(companyName);

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

        {/* Notification bell */}
        <button
          aria-label="Notifications"
          className={[
            "relative flex h-8 w-8 items-center justify-center rounded-lg",
            "text-slate-500 dark:text-slate-400",
            "hover:bg-slate-100 dark:hover:bg-white/[0.06]",
            "transition-colors duration-150",
          ].join(" ")}
        >
          <Bell className="h-[18px] w-[18px]" />
          {/* Animated pulse unread dot */}
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />
          </span>
        </button>

        {/* User / company dropdown */}
        <div ref={ref} className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-haspopup="true"
            className={[
              "flex items-center gap-2 rounded-xl border py-1 pl-1.5 pr-2.5",
              "transition-all duration-150",
              menuOpen
                ? "border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/30"
                : "border-slate-200 bg-white hover:bg-slate-50 dark:border-white/[0.08] dark:bg-transparent dark:hover:bg-white/[0.04]",
            ].join(" ")}
          >
            {/* Gradient initials avatar */}
            <span
              className={[
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                "bg-gradient-to-br text-[11px] font-bold text-white",
                gradient,
              ].join(" ")}
              aria-hidden
            >
              {initials}
            </span>

            {/* Name + plan (hidden on xs) */}
            <div className="hidden text-left leading-tight sm:block">
              <p className="max-w-[120px] truncate text-[12px] font-semibold text-slate-800 dark:text-slate-100">
                {companyName}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                {plan ? `${PLAN_LABELS[plan] ?? plan} plan` : "Organization"}
              </p>
            </div>

            <ChevronDown
              className={[
                "h-3.5 w-3.5 text-slate-400 transition-transform duration-200",
                menuOpen ? "rotate-180" : "rotate-0",
              ].join(" ")}
            />
          </button>

          {/* Dropdown */}
          <div
            className={[
              "absolute right-0 mt-2 w-60 origin-top-right overflow-hidden",
              "rounded-xl border border-slate-200/80 dark:border-white/[0.08]",
              "bg-white dark:bg-slate-900",
              "shadow-xl shadow-slate-200/60 dark:shadow-black/40",
              "transition-all duration-200",
              menuOpen
                ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                : "opacity-0 scale-95 -translate-y-1 pointer-events-none",
            ].join(" ")}
          >
            {/* User info header */}
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/[0.06] p-3">
              <Avatar
                name={session?.user.name ?? "User"}
                src={session?.user.avatar_url}
                size="sm"
              />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                  {session?.user.name ?? "User"}
                </p>
                <p className="truncate text-[11px] text-slate-400 dark:text-slate-500">
                  {session?.user.email ?? ""}
                </p>
              </div>
            </div>

            {/* Nav items */}
            <div className="p-1">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  router.push("/settings/profile");
                }}
                className={[
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px]",
                  "text-slate-700 dark:text-slate-300",
                  "hover:bg-slate-50 dark:hover:bg-white/[0.06]",
                  "transition-colors duration-100",
                ].join(" ")}
              >
                <User className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                Profile
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  router.push("/settings");
                }}
                className={[
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px]",
                  "text-slate-700 dark:text-slate-300",
                  "hover:bg-slate-50 dark:hover:bg-white/[0.06]",
                  "transition-colors duration-100",
                ].join(" ")}
              >
                <Settings className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                Settings
              </button>

              {plan === "free" && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/settings/billing");
                  }}
                  className={[
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px]",
                    "text-violet-600 dark:text-violet-400",
                    "hover:bg-violet-50 dark:hover:bg-violet-900/20",
                    "transition-colors duration-100",
                  ].join(" ")}
                >
                  <Zap className="h-4 w-4" />
                  Upgrade to Pro
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100 dark:bg-white/[0.06]" />

            {/* Sign out */}
            <div className="p-1">
              <button
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className={[
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px]",
                  "text-rose-600 dark:text-rose-400",
                  "hover:bg-rose-50 dark:hover:bg-rose-900/20",
                  "transition-colors duration-100",
                ].join(" ")}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
