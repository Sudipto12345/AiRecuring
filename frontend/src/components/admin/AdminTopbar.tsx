"use client";

import { useRouter } from "next/navigation";
import { LogOut, Menu, Search, ShieldCheck } from "lucide-react";

import { ThemeToggle } from "@/components/admin/ThemeToggle";
import { useCommandPalette } from "@/components/admin/CommandPalette";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/lib/auth";

export function AdminTopbar({ onMenu }: { onMenu?: () => void }) {
  const { session, logout } = useAuth();
  const { open } = useCommandPalette();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 flex h-13 items-center gap-3 border-b a-border a-surface px-4 backdrop-blur-xl lg:px-6">
      <button
        onClick={onMenu}
        className="a-hover flex h-8 w-8 items-center justify-center rounded-lg border a-border a-muted lg:hidden"
        aria-label="Open mobile menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      <span className="hidden items-center gap-1.5 rounded-md border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 sm:inline-flex">
        <ShieldCheck className="h-3.5 w-3.5" /> Platform Owner
      </span>

      <button
        onClick={open}
        className="group ml-1 flex h-8 flex-1 max-w-xs sm:max-w-sm items-center gap-2 rounded-lg border a-border a-surface-2 px-2.5 text-[12px] a-faint hover:a-border-strong hover:a-text transition-all"
      >
        <Search className="h-3.5 w-3.5 a-faint group-hover:text-indigo-500 transition-colors" />
        <span className="truncate">Search workspaces, billing…</span>
        <kbd className="a-elevated a-border a-faint ml-auto rounded border px-1.5 py-0.5 text-[9px] font-bold">⌘K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />

        <div className="a-surface-2 a-border hidden items-center gap-2 rounded-lg border px-2.5 py-1 sm:flex">
          <div className="relative">
            <Avatar name={session?.user.name ?? "Super Admin"} src={session?.user.avatar_url} size="sm" />
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border-[1.5px] border-white bg-emerald-500 dark:border-zinc-900" />
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[12px] font-medium a-text">{session?.user.name ?? "Platform Owner"}</p>
            <p className="truncate text-[10px] a-faint">{session?.user.email ?? "owner@airecruit.io"}</p>
          </div>
        </div>

        <button
          onClick={() => { logout(); router.push("/login"); }}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 text-[11px] font-medium text-rose-600 hover:bg-rose-500/20 dark:text-rose-400 transition-all"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
