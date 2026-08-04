"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { AdminAiAssistant } from "@/components/admin/AdminAiAssistant";
import { CommandPaletteProvider } from "@/components/admin/CommandPalette";
import { ContextDrawerProvider } from "@/components/admin/ContextDrawer";
import { getToken } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { AdminThemeProvider, useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminThemeProvider>
      <AdminShell>{children}</AdminShell>
    </AdminThemeProvider>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const { session, loading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!session || !getToken()) {
      if (typeof window !== "undefined") {
        window.location.replace("/login");
      } else {
        router.replace("/login");
      }
      return;
    }

    if (session.user.role !== "super_admin") {
      if (typeof window !== "undefined") {
        window.location.replace("/dashboard");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [loading, session, router]);

  if (loading || !session || session.user.role !== "super_admin") {
    return (
      <div data-theme={theme} className="a-bg a-text flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <span className="text-[11px] a-muted">Loading platform…</span>
        </div>
      </div>
    );
  }

  return (
    <div data-theme={theme} className="a-bg a-text relative flex h-screen w-full overflow-hidden font-sans antialiased">
      {/* Subtle Ambient Mesh — soft floating glows */}
      {theme === "dark" ? (
        <>
          <div className="pointer-events-none absolute -top-60 -left-60 h-[600px] w-[600px] rounded-full bg-indigo-600/[0.07] blur-[160px] animate-glow-slow" />
          <div className="pointer-events-none absolute top-1/4 -right-60 h-[550px] w-[550px] rounded-full bg-purple-600/[0.06] blur-[150px] animate-glow-fast" />
        </>
      ) : (
        <>
          <div className="pointer-events-none absolute -top-60 -left-60 h-[500px] w-[500px] rounded-full bg-indigo-500/[0.03] blur-[140px]" />
          <div className="pointer-events-none absolute top-1/3 -right-60 h-[450px] w-[450px] rounded-full bg-slate-300/[0.2] blur-[120px]" />
        </>
      )}

      <CommandPaletteProvider>
        <ContextDrawerProvider>
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <AdminSidebar />
          </div>

          {/* Mobile Drawer Overlay */}
          <div
            className={cn(
              "fixed inset-0 z-50 transition-opacity duration-300 lg:hidden",
              mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}
          >
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <div
              className={cn(
                "absolute left-0 top-0 h-full transform transition-transform duration-300 ease-out shadow-2xl",
                mobileOpen ? "translate-x-0" : "-translate-x-full"
              )}
            >
              <AdminSidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <AdminTopbar onMenu={() => setMobileOpen(true)} />
            <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 space-y-5 no-scrollbar">
              {children}
            </main>
          </div>
        </ContextDrawerProvider>
      </CommandPaletteProvider>
    </div>
  );
}
