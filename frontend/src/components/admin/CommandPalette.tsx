"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Search } from "lucide-react";

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
  placeholder = "Search companies, users, plans, settings…",
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
        <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />
          <div className="a-elevated a-shadow-pop animate-pop relative w-full max-w-xl overflow-hidden rounded-2xl border a-border">
            <div className="flex items-center gap-3 border-b a-border px-4">
              <Search className="h-5 w-5 a-faint" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onListKey}
                placeholder={placeholder}
                className="h-14 flex-1 bg-transparent text-sm a-text outline-none placeholder:a-faint"
              />
              <kbd className="rounded border a-border px-1.5 py-0.5 text-[10px] a-faint">ESC</kbd>
            </div>
            <div className="max-h-[50vh] overflow-y-auto py-2">
              {results.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm a-faint">No matches.</p>
              ) : (
                results.map((r, i) => (
                  <button
                    key={r.href}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(r.href)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm",
                      i === active ? "bg-[var(--admin-accent-soft)] a-accent" : "a-text",
                    )}
                  >
                    <span className="flex-1">{r.label}</span>
                    <span className="text-xs a-faint">{r.group}</span>
                    {i === active && <CornerDownLeft className="h-3.5 w-3.5 a-faint" />}
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
