"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Search, X } from "lucide-react";

import { ADMIN_COMMANDS, type CommandEntry } from "@/lib/adminNav";
import { cn } from "@/lib/utils";

interface PaletteState {
  open: () => void;
  close: () => void;
}

const PaletteContext = createContext<PaletteState | null>(null);

export function CommandPaletteProvider({
  children,
  commands = ADMIN_COMMANDS,
  placeholder = "Search workspaces, users, system settings…",
}: {
  children: React.ReactNode;
  commands?: CommandEntry[];
  placeholder?: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const open = useCallback(() => {
    setQuery("");
    setActive(0);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => `${c.label} ${c.group}`.toLowerCase().includes(q));
  }, [query, commands]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((v) => !v);
        setQuery("");
        setActive(0);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => setActive(0), [query]);

  const go = useCallback(
    (href: string) => {
      setIsOpen(false);
      router.push(href);
    },
    [router],
  );

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active].href);
    }
  };

  return (
    <PaletteContext.Provider value={{ open, close }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6">
          {/* Centered Modal Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
            onClick={close}
          />

          {/* Centered Modal Container */}
          <div className="animate-pop relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0d121f] text-slate-100 shadow-2xl shadow-black/80 backdrop-blur-2xl">
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onListKey}
                placeholder={placeholder}
                className="h-9 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
              />
              <kbd className="rounded border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 text-[9px] font-semibold text-slate-400">
                ESC
              </kbd>
            </div>

            {/* Command Results */}
            <div className="max-h-[55vh] overflow-y-auto p-2 space-y-0.5 no-scrollbar">
              {results.length === 0 ? (
                <p className="px-4 py-8 text-center text-xs text-slate-500">No matching commands found.</p>
              ) : (
                results.map((r, i) => (
                  <button
                    key={r.href}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(r.href)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-all duration-150",
                      i === active
                        ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                        : "text-slate-300 hover:bg-white/[0.04]"
                    )}
                  >
                    <span className="flex-1 truncate">{r.label}</span>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{r.group}</span>
                    {i === active && <CornerDownLeft className="h-3 w-3 text-indigo-400" />}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </PaletteContext.Provider>
  );
}

export function useCommandPalette() {
  const ctx = useContext(PaletteContext);
  if (!ctx) throw new Error("useCommandPalette must be used within CommandPaletteProvider");
  return ctx;
}
