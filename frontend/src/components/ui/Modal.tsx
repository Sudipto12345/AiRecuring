"use client";

import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8">
      <div className="fixed inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 w-full ${size} animate-drawer rounded-2xl bg-white shadow-pop`}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 className="text-base font-semibold text-ink-900">{title}</h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-slate-100 hover:text-ink-700">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
