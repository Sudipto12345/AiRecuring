"use client";

import { Command, Search } from "lucide-react";

import { useCommandPalette } from "@/components/admin/CommandPalette";

export default function GlobalSearchPage() {
  const { open } = useCommandPalette();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 p-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl a-accent-soft">
        <Search className="h-7 w-7" />
      </span>
      <div>
        <h1 className="text-xl font-semibold a-text">Global Search</h1>
        <p className="mt-1 max-w-md text-sm a-muted">
          Jump to any job, candidate, interview, report or setting from one place.
        </p>
      </div>
      <button
        onClick={open}
        className="a-hover flex items-center gap-2 rounded-xl border a-border px-4 py-3 text-sm a-text"
      >
        <Search className="h-4 w-4" /> Open search
        <kbd className="ml-2 flex items-center gap-1 rounded border a-border px-1.5 py-0.5 text-[10px] a-faint">
          <Command className="h-3 w-3" /> K
        </kbd>
      </button>
    </div>
  );
}
