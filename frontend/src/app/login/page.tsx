"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Sparkles, ArrowRight } from "lucide-react";

import { AuthHero } from "@/components/auth/AuthHero";
import { DemoAccounts } from "@/components/auth/DemoAccounts";
import { SystemHealth } from "@/components/auth/SystemHealth";
import { Logo } from "@/components/layout/Logo";
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
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [shake, setShake] = useState(false);

  async function doLogin(loginEmail: string, loginPassword: string) {
    setBusy(true);
    setError(null);
    try {
      const session = await login(loginEmail, loginPassword);
      router.replace(session.user.role === "super_admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setBusy(false);
      setShake(true);
      setTimeout(() => setShake(false), 600);
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
    <>
      {/* Inject keyframes via a style tag */}
      <style>{`
        @keyframes blob-one {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -60px) scale(1.15); }
          66% { transform: translate(-30px, 30px) scale(0.9); }
        }
        @keyframes blob-two {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-50px, 40px) scale(1.1); }
          66% { transform: translate(30px, -20px) scale(0.95); }
        }
        @keyframes blob-three {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -40px) scale(1.12); }
        }
        @keyframes page-fade-in {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-8px); }
          30% { transform: translateX(8px); }
          45% { transform: translateX(-6px); }
          60% { transform: translateX(6px); }
          75% { transform: translateX(-3px); }
          90% { transform: translateX(3px); }
        }
        @keyframes spin-smooth {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes badge-pop {
          from { opacity: 0; transform: scale(0.85) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .air-blob-one { animation: blob-one 10s ease-in-out infinite; }
        .air-blob-two { animation: blob-two 13s ease-in-out infinite; }
        .air-blob-three { animation: blob-three 8s ease-in-out infinite; }

        .air-form-card {
          animation: page-fade-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .air-shake {
          animation: shake 0.55s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }

        .air-btn-shimmer {
          background-size: 200% auto;
          background-image: linear-gradient(
            120deg,
            #4f46e5 0%,
            #7c3aed 30%,
            #a855f7 50%,
            #7c3aed 70%,
            #4f46e5 100%
          );
          transition: background-position 0.4s ease, box-shadow 0.2s ease, transform 0.15s ease;
        }
        .air-btn-shimmer:hover:not(:disabled) {
          background-position: right center;
          box-shadow: 0 8px 30px -6px rgba(99, 102, 241, 0.65);
          transform: translateY(-1px);
        }
        .air-btn-shimmer:active:not(:disabled) {
          transform: translateY(0);
        }

        .air-spinner {
          width: 18px;
          height: 18px;
          border: 2.5px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin-smooth 0.75s linear infinite;
          display: inline-block;
          flex-shrink: 0;
        }

        .air-input-wrap { position: relative; }
        .air-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
          transition: color 0.2s;
        }
        .air-input-wrap:focus-within .air-input-icon { color: #6366f1; }

        .air-input {
          width: 100%;
          padding: 11px 14px 11px 42px;
          background: rgba(255, 255, 255, 0.75);
          border: 1.5px solid rgba(226, 232, 240, 0.9);
          border-radius: 12px;
          font-size: 14px;
          color: #0f172a;
          outline: none;
          transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
          backdrop-filter: blur(4px);
        }
        .air-input::placeholder { color: #94a3b8; }
        .air-input:focus {
          border-color: #6366f1;
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
        }
        .air-input-pr { padding-right: 44px; }

        .air-glass-card {
          background: rgba(255, 255, 255, 0.78);
          backdrop-filter: blur(20px) saturate(1.6);
          -webkit-backdrop-filter: blur(20px) saturate(1.6);
          border: 1px solid rgba(255, 255, 255, 0.7);
          box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.04),
            0 20px 60px -12px rgba(79, 70, 229, 0.18),
            inset 0 1px 0 rgba(255,255,255,0.85);
        }

        .air-badge {
          animation: badge-pop 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
          background: rgba(255,255,255,0.75);
          border: 1px solid rgba(255,255,255,0.8);
          backdrop-filter: blur(8px);
          color: #475569;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          display: flex;
          align-items: center;
          gap: 6px;
          border-radius: 9999px;
          padding: 6px 12px;
          font-size: 11px;
          font-weight: 500;
        }
        .air-badge:nth-child(2) { animation-delay: 0.07s; }
        .air-badge:nth-child(3) { animation-delay: 0.14s; }

        .air-cb {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1.5px solid #cbd5e1;
          background: white;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          transition: all 0.15s ease;
          flex-shrink: 0;
          position: relative;
        }
        .air-cb:checked {
          background: #6366f1;
          border-color: #6366f1;
        }
        .air-cb:checked::after {
          content: '';
          position: absolute;
          left: 4px;
          top: 1.5px;
          width: 5px;
          height: 9px;
          border: 2px solid white;
          border-top: none;
          border-left: none;
          transform: rotate(45deg);
        }
        .air-cb:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }
      `}</style>

      <div className="grid min-h-screen lg:grid-cols-2">
        {/* ── LEFT PANEL ── */}
        <div
          className="relative flex items-center justify-center overflow-hidden px-6 py-12"
          style={{
            background:
              "linear-gradient(145deg, #eef2ff 0%, #ede9fe 35%, #f5f3ff 60%, #fdf4ff 100%)",
          }}
        >
          {/* Animated background blobs */}
          <div
            className="air-blob-one pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full opacity-50"
            style={{
              background:
                "radial-gradient(circle at center, #818cf8 0%, #6366f1 40%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
          <div
            className="air-blob-two pointer-events-none absolute -right-20 top-1/3 h-80 w-80 rounded-full opacity-40"
            style={{
              background:
                "radial-gradient(circle at center, #a78bfa 0%, #8b5cf6 40%, transparent 70%)",
              filter: "blur(55px)",
            }}
          />
          <div
            className="air-blob-three pointer-events-none absolute -bottom-20 left-1/3 h-72 w-72 rounded-full opacity-35"
            style={{
              background:
                "radial-gradient(circle at center, #c084fc 0%, #a855f7 40%, transparent 70%)",
              filter: "blur(50px)",
            }}
          />

          {/* Subtle mesh grid overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Glass card */}
          <div
            className={`air-glass-card air-form-card relative w-full max-w-[420px] rounded-2xl p-8 ${
              shake ? "air-shake" : ""
            }`}
          >
            {/* Logo + tagline */}
            <div className="mb-7">
              <Logo />
              <div className="mt-5">
                <h1
                  className="text-2xl font-bold tracking-tight"
                  style={{ color: "#0f172a" }}
                >
                  Welcome back
                </h1>
                <p className="mt-1 text-sm" style={{ color: "#64748b" }}>
                  Sign in to your recruiting workspace.
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="space-y-4">
              {/* Email field */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium"
                  style={{ color: "#334155" }}
                >
                  Work email
                </label>
                <div className="air-input-wrap">
                  <span className="air-input-icon">
                    <Mail size={16} />
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="air-input"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium"
                  style={{ color: "#334155" }}
                >
                  Password
                </label>
                <div className="air-input-wrap">
                  <span className="air-input-icon">
                    <Lock size={16} />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="air-input air-input-pr"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      transition: "background 0.15s",
                    }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember me + forgot password */}
              <div className="flex items-center justify-between pt-0.5">
                <label
                  className="flex cursor-pointer items-center gap-2"
                  style={{ userSelect: "none" }}
                >
                  <input
                    type="checkbox"
                    className="air-cb"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="text-sm" style={{ color: "#64748b" }}>
                    Remember me
                  </span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium transition-colors hover:underline"
                  style={{ color: "#6366f1" }}
                >
                  Forgot password?
                </Link>
              </div>

              {/* Error state */}
              {error && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    background: "rgba(254, 226, 226, 0.7)",
                    border: "1px solid rgba(252, 165, 165, 0.6)",
                    borderRadius: "12px",
                    padding: "10px 14px",
                  }}
                >
                  <svg
                    style={{ marginTop: "2px", flexShrink: 0, color: "#ef4444" }}
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4m0 4h.01" />
                  </svg>
                  <p className="text-sm" style={{ color: "#b91c1c" }}>
                    {error}
                  </p>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={busy}
                className="air-btn-shimmer"
                style={{
                  marginTop: "4px",
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  borderRadius: "12px",
                  padding: "12px 20px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "white",
                  border: "none",
                  cursor: busy ? "not-allowed" : "pointer",
                  opacity: busy ? 0.7 : 1,
                  minHeight: "46px",
                }}
              >
                {busy ? (
                  <>
                    <span className="air-spinner" />
                    <span>Signing in…</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} style={{ opacity: 0.85 }} />
                    <span>Sign in</span>
                    <ArrowRight size={15} style={{ opacity: 0.85 }} />
                  </>
                )}
              </button>
            </form>

            {/* Demo accounts */}
            <DemoAccounts onPick={pickDemo} busy={busy} />

            {/* Register link */}
            <p className="mt-6 text-center text-sm" style={{ color: "#64748b" }}>
              New here?{" "}
              <Link
                href="/register"
                className="font-semibold transition-colors hover:underline"
                style={{ color: "#4f46e5" }}
              >
                Create a company account
              </Link>
            </p>

            {/* Dev system health */}
            {isDev && (
              <div className="mt-6">
                <SystemHealth />
              </div>
            )}
          </div>

          {/* Social proof badges */}
          <div
            style={{
              position: "absolute",
              bottom: "24px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "nowrap",
            }}
          >
            <span className="air-badge">
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#10b981",
                  flexShrink: 0,
                }}
              />
              Trusted by 500+ companies
            </span>
            <span className="air-badge">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6366f1"
                strokeWidth={2.5}
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              SOC 2 compliant
            </span>
            <span className="air-badge" style={{ display: "none" }}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f59e0b"
                strokeWidth={2.5}
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              4.9 / 5 rating
            </span>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <AuthHero />
      </div>
    </>
  );
}
