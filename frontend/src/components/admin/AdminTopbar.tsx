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
    <header className="a-surface sticky top-0 z-30 flex h-16 items-center gap-3 border-b a-border px-4 lg:px-6">
      <button onClick={onMenu} className="a-hover rounded-lg p-2 a-muted lg:hidden">
        <Menu className="h-5 w-5" />
      </button>

      <span className="hidden items-center gap-1.5 rounded-full bg-[var(--admin-accent-soft)] px-2.5 py-1 text-xs font-medium a-accent sm:inline-flex">
        <ShieldCheck className="h-3.5 w-3.5" /> Platform Admin
      </span>

      <button
        onClick={open}
        className="a-hover ml-2 flex h-9 flex-1 max-w-md items-center gap-2 rounded-lg border a-border px-3 text-sm a-faint"
      >
        <Search className="h-4 w-4" />
        <span>Search anything…</span>
        <kbd className="ml-auto rounded border a-border px-1.5 py-0.5 text-[10px]">⌘K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <div className="hidden items-center gap-2.5 rounded-xl border a-border px-2.5 py-1.5 sm:flex">
          <Avatar name={session?.user.name ?? "Admin"} src={session?.user.avatar_url} size="sm" />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[13px] font-semibold a-text">{session?.user.name}</p>
            <p className="truncate text-[11px] a-faint">{session?.user.email}</p>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="a-hover flex h-9 items-center gap-1.5 rounded-lg border a-border px-3 text-sm a-muted"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
