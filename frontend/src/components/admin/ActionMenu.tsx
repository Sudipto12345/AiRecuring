"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ActionItem {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  danger?: boolean;
  separatorBefore?: boolean;
}

export function ActionMenu({ items, label }: { items: ActionItem[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="a-hover flex h-8 items-center gap-1 rounded-lg border a-border px-2 a-muted"
      >
        <MoreHorizontal className="h-4 w-4" />
        {label && <span className="text-xs">{label}</span>}
      </button>
      {open && (
        <div className="a-elevated a-shadow-pop animate-pop absolute right-0 z-50 mt-1 w-52 overflow-hidden rounded-xl border a-border py-1">
          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <div key={i}>
                {it.separatorBefore && <div className="my-1 border-t a-border" />}
                <button
                  onClick={() => {
                    setOpen(false);
                    it.onClick();
                  }}
                  className={cn(
                    "a-hover flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm",
                    it.danger ? "text-rose-500" : "a-text",
                  )}
                >
                  {Icon && <Icon className="h-4 w-4 opacity-70" />}
                  {it.label}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
