"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, LayoutDashboard, Menu, Users, Video } from "lucide-react";

import { cn } from "@/lib/utils";

const ITEMS = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Jobs", href: "/jobs", icon: Briefcase },
  { label: "People", href: "/candidates", icon: Users },
  { label: "Interviews", href: "/interviews", icon: Video },
];

export function MobileBottomNav({ onMore }: { onMore: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="a-surface fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t a-border lg:hidden">
      {ITEMS.map((it) => {
        const Icon = it.icon;
        const active = pathname === it.href || pathname.startsWith(it.href + "/");
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium",
              active ? "a-accent" : "a-faint",
            )}
          >
            <Icon className="h-5 w-5" />
            {it.label}
          </Link>
        );
      })}
      <button onClick={onMore} className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium a-faint">
        <Menu className="h-5 w-5" />
        More
      </button>
    </nav>
  );
}
