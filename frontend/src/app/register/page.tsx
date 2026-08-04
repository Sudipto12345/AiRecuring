"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthHero } from "@/components/auth/AuthHero";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Field";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    company_name: "",
    industry: "",
    admin_name: "",
    email: "",
    password: "",
    plan: "free",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const updateInput = <T extends HTMLInputElement | HTMLSelectElement>(
    k: keyof typeof form,
  ) => (e: ChangeEvent<T>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const updateSelect = updateInput;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await register(form);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <Logo />
          <div className="mt-8">
            <h1 className="text-2xl font-bold tracking-tight text-ink-900">Create your workspace</h1>
            <p className="mt-1 text-sm text-ink-500">Get started today. Upgrade anytime.</p>
          </div>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label htmlFor="company">Company name</Label>
                <Input id="company" required value={form.company_name} onChange={updateInput("company_name")} placeholder="Three Slash IT" />
              </div>
              <div className="col-span-2">
                <Label htmlFor="plan">Subscription Plan</Label>
                <Select id="plan" value={form.plan} onChange={updateSelect("plan")}>
                  <option value="free">Free (2 Seats, 50 CVs)</option>
                  <option value="pro">Pro (15 Seats, Exam Portal)</option>
                  <option value="enterprise">Enterprise (Unlimited)</option>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" value={form.industry} onChange={updateInput("industry")} placeholder="Software" />
              </div>
              <div className="col-span-2">
                <Label htmlFor="name">Your name</Label>
                <Input id="name" required value={form.admin_name} onChange={updateInput("admin_name")} placeholder="Hamza Haque" />
              </div>
              <div className="col-span-2">
                <Label htmlFor="email">Work email</Label>
                <Input id="email" type="email" required value={form.email} onChange={updateInput("email")} placeholder="you@company.com" />
              </div>
              <div className="col-span-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required minLength={6} value={form.password} onChange={updateInput("password")} placeholder="At least 6 characters" />
              </div>
            </div>

            {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? "Creating..." : "Create workspace"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-brand-700 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      <AuthHero />
    </div>
  );
}
