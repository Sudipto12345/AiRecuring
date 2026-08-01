"use client";

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
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-auto">
      <div className="absolute inset-0 bg-ink-900/20 lg:hidden" onClick={onClose} />
      <aside
        className={cn(
          "animate-drawer absolute right-0 top-0 h-full w-[88%] overflow-y-auto border-l border-line bg-white shadow-pop lg:static lg:h-auto lg:w-full lg:shadow-none",
          width,
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 hover:bg-slate-100 hover:text-ink-700"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </aside>
    </div>
  );
}
