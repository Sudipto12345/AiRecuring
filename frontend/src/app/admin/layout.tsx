"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
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
    if (!session && !getToken()) {
      router.replace("/login");
    } else if (session && session.user.role !== "super_admin") {
      router.replace("/dashboard");
    }
  }, [loading, session, router]);

  if (loading || !session || session.user.role !== "super_admin") {
    return (
      <div data-theme={theme} className="a-bg flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--admin-border)] border-t-[var(--admin-accent)]" />
      </div>
    );
  }

  return (
    <div data-theme={theme} className="a-bg a-text flex h-screen overflow-hidden">
      <CommandPaletteProvider>
        <ContextDrawerProvider>
          <div className="hidden lg:block">
            <AdminSidebar />
          </div>

          <div className={cn(
            "fixed inset-0 z-50 transition-opacity duration-300 lg:hidden",
            mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}>
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
            <div className={cn(
              "absolute left-0 top-0 h-full transform transition-transform duration-300 ease-out",
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            )}>
              <AdminSidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <AdminTopbar onMenu={() => setMobileOpen(true)} />
            <main className="flex-1 overflow-y-auto p-5 lg:p-6">{children}</main>
          </div>
        </ContextDrawerProvider>
      </CommandPaletteProvider>
    </div>
  );
}
