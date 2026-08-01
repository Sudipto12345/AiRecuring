"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    // Wait for /auth/me to validate the token server-side before routing.
    if (loading) return;
    if (!session) {
      router.replace("/login");
    } else {
      router.replace(session.user.role === "super_admin" ? "/admin" : "/dashboard");
    }
  }, [loading, session, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
    </div>
  );
}
