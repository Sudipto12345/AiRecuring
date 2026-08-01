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
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={close} />
          <div
            className="a-surface a-shadow-pop animate-drawer absolute right-0 top-0 flex h-full flex-col border-l a-border"
            style={{ width: content.width ?? 420 }}
          >
            <div className="flex items-start justify-between gap-3 border-b a-border px-5 py-4">
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold a-text">{content.title}</h2>
                {content.subtitle && <p className="truncate text-xs a-faint">{content.subtitle}</p>}
              </div>
              <button onClick={close} className="a-hover rounded-lg p-1 a-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{content.node}</div>
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
