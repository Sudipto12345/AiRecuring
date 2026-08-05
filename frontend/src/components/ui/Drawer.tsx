"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

export function Drawer({
  open,
  onClose,
  children,
  width = "max-w-md",
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Side drawer"
      className="fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-auto"
    >
      <div className="absolute inset-0 bg-ink-900/20 dark:bg-black/50 lg:hidden" onClick={onClose} aria-hidden="true" />
      <aside
        className={cn(
          "animate-drawer absolute right-0 top-0 h-full w-[88%] overflow-y-auto border-l border-line dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-pop lg:static lg:h-auto lg:w-full lg:shadow-none",
          width,
        )}
      >
        <button
          onClick={onClose}
          aria-label="Close drawer"
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-ink-700 dark:hover:text-zinc-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </aside>
    </div>
  );
}
