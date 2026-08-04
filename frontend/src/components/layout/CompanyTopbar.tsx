"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Calendar,
  CheckSquare,
  ChevronDown,
  Globe,
  LogOut,
  Menu,
  Search,
  Settings,
  User as UserIcon,
} from "lucide-react";

import { CreditBadge } from "@/components/layout/CreditBadge";
import { ThemeToggle } from "@/components/admin/ThemeToggle";
import { useCommandPalette } from "@/components/admin/CommandPalette";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/lib/auth";
import { PLAN_LABELS } from "@/lib/nav";

export function CompanyTopbar({ onMenu }: { onMenu: () => void }) {
  const { session, logout } = useAuth();
  const { open: openPalette } = useCommandPalette();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [now, setNow] = useState<{ date: string; weekday: string } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const d = new Date();
    setNow({
      date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      weekday: d.toLocaleDateString("en-US", { weekday: "long" }),
    });
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
    <header className="a-surface sticky top-0 z-30 flex h-16 items-center gap-3 border-b a-border px-4 lg:px-6">
      <button onClick={onMenu} className="a-hover rounded-lg p-2 a-muted lg:hidden">
        <Menu className="h-5 w-5" />
      </button>

      <button
        onClick={openPalette}
        className="a-hover flex h-10 flex-1 max-w-xl items-center gap-2 rounded-xl border a-border px-3 text-sm a-faint"
      >
        <Search className="h-4 w-4" />
        <span className="truncate">Search candidates, jobs, interviews…</span>
        <kbd className="ml-auto hidden rounded border a-border px-1.5 py-0.5 text-[10px] sm:inline">⌘K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-xl border a-border px-3 py-1.5 lg:flex">
          <Calendar className="h-4 w-4 text-brand-500" />
          <div className="leading-tight">
            <p className="text-xs font-semibold a-text">{now?.date ?? "—"}</p>
            <p className="text-[10px] a-faint">{now?.weekday ?? ""}</p>
          </div>
        </div>

        <CreditBadge />

        <button
          onClick={() => router.push("/communication/invitations")}
          className="a-hover hidden h-10 w-10 items-center justify-center rounded-xl border a-border a-muted sm:flex"
          title="Tasks"
        >
          <CheckSquare className="h-[18px] w-[18px]" />
        </button>

        <button
          onClick={() => router.push("/communication/notifications")}
          className="a-hover relative flex h-10 w-10 items-center justify-center rounded-xl border a-border a-muted"
          title="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-slate-900" />
        </button>

        <button
          className="a-hover hidden h-10 w-10 items-center justify-center rounded-xl border a-border a-muted xl:flex"
          title="Language"
        >
          <Globe className="h-[18px] w-[18px]" />
        </button>

        <ThemeToggle />

        <div ref={ref} className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="a-hover flex items-center gap-2.5 rounded-xl border a-border py-1.5 pl-2 pr-2.5"
          >
            <Avatar name={session?.user.name ?? "User"} src={session?.user.avatar_url} size="sm" />
            <div className="hidden text-left leading-tight sm:block">
              <p className="max-w-[140px] truncate text-[13px] font-semibold a-text">{session?.user.name}</p>
              <p className="text-[10px] a-faint">{plan ? `${PLAN_LABELS[plan] ?? plan} plan` : "Member"}</p>
            </div>
            <ChevronDown className="h-4 w-4 a-faint" />
          </button>

          {menuOpen && (
            <div className="a-elevated a-shadow-pop absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border a-border">
              <div className="flex items-center gap-3 border-b a-border p-3">
                <Avatar name={session?.user.name ?? "User"} src={session?.user.avatar_url} size="sm" />
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-sm font-semibold a-text">{session?.user.name}</p>
                  <p className="truncate text-xs a-faint">{session?.user.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  router.push("/settings");
                }}
                className="a-hover flex w-full items-center gap-2 px-3 py-2.5 text-sm a-muted"
              >
                <UserIcon className="h-4 w-4" /> Profile &amp; preferences
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  router.push("/settings");
                }}
                className="a-hover flex w-full items-center gap-2 px-3 py-2.5 text-sm a-muted"
              >
                <Settings className="h-4 w-4" /> Workspace settings
              </button>
              <button
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="flex w-full items-center gap-2 border-t a-border px-3 py-2.5 text-sm text-rose-500 hover:bg-rose-500/10"
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
