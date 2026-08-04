"use client";

import { Check, Moon, Sun } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function AppearancePage() {
  const { theme, setTheme } = useTheme();
  const options: { key: "light" | "dark"; label: string; icon: typeof Sun }[] = [
    { key: "light", label: "Light", icon: Sun },
    { key: "dark", label: "Dark", icon: Moon },
  ];

  return (
    <div className="space-y-5 p-4 lg:p-6">
      <AdminPageHeader title="Appearance" subtitle="Choose how your workspace looks." />

      <div className="a-card p-5">
        <h3 className="mb-3 text-sm font-semibold a-text">Theme</h3>
        <div className="grid grid-cols-2 gap-4 sm:max-w-md">
          {options.map((o) => {
            const Icon = o.icon;
            const active = theme === o.key;
            return (
              <button
                key={o.key}
                onClick={() => setTheme(o.key)}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl border p-4 text-left",
                  active ? "border-indigo-600 a-accent-soft" : "a-border a-hover",
                )}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg a-surface-2">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium a-text">{o.label}</span>
                {active && <Check className="absolute right-3 top-3 h-4 w-4 a-accent" />}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs a-faint">Your theme preference is saved to this browser.</p>
      </div>
    </div>
  );
}
