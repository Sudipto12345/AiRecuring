"use client";

import { useRouter } from "next/navigation";
import { LogOut, Menu, Search, ShieldCheck } from "lucide-react";

import { ThemeToggle } from "@/components/admin/ThemeToggle";
import { useCommandPalette } from "@/components/admin/CommandPalette";
import { ProfileDropdown } from "@/components/ui/ProfileDropdown";
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
        <ProfileDropdown />
      </div>
    </header>
  );
}
