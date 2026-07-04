"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthHero } from "@/components/auth/AuthHero";
import { DemoAccounts } from "@/components/auth/DemoAccounts";
import { SystemHealth } from "@/components/auth/SystemHealth";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const isDev = process.env.NODE_ENV !== "production";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function doLogin(loginEmail: string, loginPassword: string) {
    setBusy(true);
    setError(null);
    try {
      const session = await login(loginEmail, loginPassword);
      router.replace(session.user.role === "super_admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await doLogin(email, password);
  }

  function pickDemo(demoEmail: string, demoPassword: string) {
    setEmail(demoEmail);
    setPassword(demoPassword);
    doLogin(demoEmail, demoPassword);
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <Logo />
          <div className="mt-8">
            <h1 className="text-2xl font-bold tracking-tight text-ink-900">Welcome back</h1>
            <p className="mt-1 text-sm text-ink-500">Sign in to your recruiting workspace.</p>
          </div>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <div>
              <Label htmlFor="email">Work email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>

            {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <DemoAccounts onPick={pickDemo} busy={busy} />

          <p className="mt-6 text-center text-sm text-ink-500">
            New here?{" "}
            <Link href="/register" className="font-semibold text-brand-700 hover:underline">
              Create a company account
            </Link>
          </p>

          {isDev && (
            <div className="mt-6">
              <SystemHealth />
            </div>
          )}
        </div>
      </div>
      <AuthHero />
    </div>
  );
}
