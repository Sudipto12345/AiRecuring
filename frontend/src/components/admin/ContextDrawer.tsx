"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { X } from "lucide-react";

interface DrawerContent {
  title: string;
  subtitle?: string;
  node: React.ReactNode;
  width?: number;
}

interface DrawerState {
  open: (content: DrawerContent) => void;
  close: () => void;
}

const DrawerContext = createContext<DrawerState | null>(null);

export function ContextDrawerProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<DrawerContent | null>(null);

  const open = useCallback((c: DrawerContent) => setContent(c), []);
  const close = useCallback(() => setContent(null), []);

  return (
    <DrawerContext.Provider value={{ open, close }}>
      {children}
      {content && (
        <div className="fixed inset-0 z-[60]">
          {/* Backdrop with smooth blur */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={close}
          />

          {/* Drawer container */}
          <div
            className="animate-drawer absolute right-0 top-0 flex h-full flex-col border-l border-white/[0.08] bg-[#0d121f] text-slate-100 shadow-2xl shadow-black/80 backdrop-blur-2xl"
            style={{ width: content.width ?? 440 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <div className="min-w-0 flex-1 pr-2">
                <h2 className="truncate text-sm font-semibold text-white">{content.title}</h2>
                {content.subtitle && <p className="mt-0.5 truncate text-[11px] text-slate-400">{content.subtitle}</p>}
              </div>
              <button
                onClick={close}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-white/[0.06] hover:text-white transition-colors"
                aria-label="Close drawer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-5 no-scrollbar">{content.node}</div>
          </div>
        </div>
      )}
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("useDrawer must be used within ContextDrawerProvider");
  return ctx;
}
