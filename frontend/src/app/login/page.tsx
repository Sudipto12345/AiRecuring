"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye, EyeOff, Mail, Lock, ArrowRight, Clock, XCircle, AlertTriangle,
  Sparkles, Building2,
} from "lucide-react";

import Image from "next/image";
import { Logo } from "@/components/layout/Logo";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type PendingState = { type: "pending" | "rejected" | "on_hold"; message: string } | null;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pendingState, setPendingState] = useState<PendingState>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setPendingState(null);
    try {
      const session = await login(email, password);
      if (session.user.role === "super_admin") router.replace("/admin");
      else router.replace("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        const msg = err.message;
        if (msg.startsWith("PENDING_VERIFICATION:")) {
          setPendingState({ type: "pending", message: msg.replace("PENDING_VERIFICATION:", "").trim() });
        } else if (msg.startsWith("REJECTED:")) {
          setPendingState({ type: "rejected", message: msg.replace("REJECTED:", "").trim() });
        } else if (msg.startsWith("ON_HOLD:")) {
          setPendingState({ type: "on_hold", message: msg.replace("ON_HOLD:", "").trim() });
        } else {
          setError(msg);
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
      setBusy(false);
    }
  }

  if (pendingState) {
    const config = {
      pending: {
        icon: <Clock className="h-10 w-10 text-amber-400" />,
        bg: "bg-amber-500/10 border-amber-500/20",
        title: "Awaiting Verification",
        subtitle: "Your company registration is under review",
        color: "text-amber-400",
        badgeBg: "bg-amber-500/20 text-amber-300",
        badgeLabel: "Pending Review",
      },
      rejected: {
        icon: <XCircle className="h-10 w-10 text-red-400" />,
        bg: "bg-red-500/10 border-red-500/20",
        title: "Registration Rejected",
        subtitle: "Your company registration was not approved",
        color: "text-red-400",
        badgeBg: "bg-red-500/20 text-red-300",
        badgeLabel: "Rejected",
      },
      on_hold: {
        icon: <AlertTriangle className="h-10 w-10 text-orange-400" />,
        bg: "bg-orange-500/10 border-orange-500/20",
        title: "Account On Hold",
        subtitle: "Your account has been placed on hold",
        color: "text-orange-400",
        badgeBg: "bg-orange-500/20 text-orange-300",
        badgeLabel: "On Hold",
      },
    }[pendingState.type];

    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 px-4">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>
        <div className="relative w-full max-w-[440px]">
          <div className="mb-6 flex justify-center"><Logo /></div>
          <div className={`rounded-2xl border ${config.bg} p-8 text-center shadow-2xl backdrop-blur-xl`}>
            <div className="mb-4 flex justify-center">{config.icon}</div>
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${config.badgeBg}`}>
              {config.badgeLabel}
            </span>
            <h2 className={`mt-3 text-xl font-bold ${config.color}`}>{config.title}</h2>
            <p className="mt-1 text-sm text-slate-400">{config.subtitle}</p>
            <p className={`mt-4 rounded-xl border ${config.bg} ${config.color} px-4 py-3 text-sm`}>
              {pendingState.message}
            </p>
            {pendingState.type === "pending" && (
              <div className="mt-6 rounded-xl bg-white/5 p-4 text-left ring-1 ring-white/10">
                <p className="mb-2 text-xs font-semibold text-slate-400">What happens next?</p>
                <ul className="space-y-1.5 text-xs text-slate-500">
                  <li className="flex items-start gap-2"><span className="mt-0.5 h-1.5 w-1.5 flex-none rounded-full bg-indigo-400" />Our team reviews your company details (usually within 24–48 hours)</li>
                  <li className="flex items-start gap-2"><span className="mt-0.5 h-1.5 w-1.5 flex-none rounded-full bg-indigo-400" />You will receive an email notification once approved</li>
                  <li className="flex items-start gap-2"><span className="mt-0.5 h-1.5 w-1.5 flex-none rounded-full bg-indigo-400" />After approval, sign in to access your full dashboard</li>
                </ul>
              </div>
            )}
            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={() => setPendingState(null)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
              >
                Back to sign in
              </button>
              {pendingState.type === "rejected" && (
                <Link href="/register" className="w-full rounded-xl bg-indigo-600 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-indigo-500">
                  Register a new account
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900">
      {/* Left branding panel */}
      <div className="hidden flex-col justify-between p-12 lg:flex lg:w-1/2">
        <Logo />
        <div className="my-auto py-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-300 ring-1 ring-emerald-500/20">
            <Sparkles className="h-4 w-4 text-emerald-400" /> Calm & Intelligent Recruitment
          </div>
          <h1 className="text-4xl font-extrabold leading-tight text-white">
            Hire smarter with<br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Peaceful AI Precision</span>
          </h1>
          <p className="mt-3 max-w-md text-sm text-slate-300">
            Rank CVs, conduct proctored AI video interviews, and empower your talent acquisition team.
          </p>

          <div className="mt-6 relative w-full h-56 rounded-2xl overflow-hidden shadow-2xl border border-emerald-500/20 group">
            <Image 
              src="/images/auth/login-hero.png" 
              alt="Calm Recruitment Platform" 
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </div>
        <p className="text-xs text-slate-500">2026 AIRecruit. All rights reserved.</p>
      </div>

      {/* Right login panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex justify-center lg:hidden"><Logo /></div>
          <div className="rounded-3xl bg-white/5 p-8 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white">Welcome back</h2>
              <p className="mt-1 text-sm text-slate-400">Sign in to your recruitment workspace</p>
            </div>

            <form onSubmit={submit} className="space-y-5" id="login-form">
              <div>
                <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="block w-full rounded-xl bg-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 ring-1 ring-white/10 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full rounded-xl bg-white/10 py-3 pl-10 pr-10 text-sm text-white placeholder-slate-500 ring-1 ring-white/10 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    id="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-500 transition hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400 ring-1 ring-red-500/20">
                  <XCircle className="mt-0.5 h-4 w-4 flex-none" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                id="login-submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {busy ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>Sign in <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-slate-500">New to AIRecruit?</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <Link
              href="/register"
              id="register-link"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <Building2 className="h-4 w-4" />
              Register your company
            </Link>

            {process.env.NODE_ENV === "development" && (
              <div className="mt-8 rounded-xl border border-dashed border-indigo-500/30 bg-indigo-500/5 p-4">
                <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  Dev Mode: Quick Login
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("owner@airecruit.io");
                      setPassword("owner12345");
                    }}
                    className="w-full rounded-lg bg-indigo-600/20 py-2 text-xs font-medium text-indigo-300 transition hover:bg-indigo-600/40"
                  >
                    Super Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("admin@enterprise.com");
                      setPassword("demo12345");
                    }}
                    className="w-full rounded-lg bg-indigo-600/20 py-2 text-xs font-medium text-indigo-300 transition hover:bg-indigo-600/40"
                  >
                    Enterprise Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("hr@enterprise.com");
                      setPassword("demo12345");
                    }}
                    className="w-full rounded-lg bg-indigo-600/20 py-2 text-xs font-medium text-indigo-300 transition hover:bg-indigo-600/40"
                  >
                    Enterprise HR
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("admin@pro.com");
                      setPassword("demo12345");
                    }}
                    className="w-full rounded-lg bg-indigo-600/20 py-2 text-xs font-medium text-indigo-300 transition hover:bg-indigo-600/40"
                  >
                    Pro Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("admin@free.com");
                      setPassword("demo12345");
                    }}
                    className="w-full rounded-lg bg-indigo-600/20 py-2 text-xs font-medium text-indigo-300 transition hover:bg-indigo-600/40"
                  >
                    Free Admin
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
