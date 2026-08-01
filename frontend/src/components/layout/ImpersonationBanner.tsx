"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, LogOut } from "lucide-react";

import { getImpersonation, stopImpersonation, type Impersonation } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export function ImpersonationBanner() {
  const { refresh } = useAuth();
  const router = useRouter();
  const [imp, setImp] = useState<Impersonation | null>(null);

  useEffect(() => {
    setImp(getImpersonation());
  }, []);

  if (!imp) return null;

  async function exit() {
    const restored = stopImpersonation();
    await refresh();
    router.replace(restored ? "/admin" : "/login");
  }

  return (
    <div className="flex items-center gap-3 bg-amber-500 px-4 py-2 text-sm font-medium text-white">
      <Eye className="h-4 w-4" />
      <span>
        Viewing as <strong>{imp.company_name}</strong>
        <span className="hidden opacity-80 sm:inline"> · {imp.user_email}</span>
      </span>
      <button
        onClick={exit}
        className="ml-auto flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1 text-xs font-semibold hover:bg-white/30"
      >
        <LogOut className="h-3.5 w-3.5" /> Return to admin
      </button>
    </div>
  );
}
