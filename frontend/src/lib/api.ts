const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const TOKEN_KEY = "airecruit_token";
const ADMIN_TOKEN_KEY = "airecruit_admin_token";
const IMP_KEY = "airecruit_impersonation";

/**
 * Retrieves active authorization token safely from window storage.
 */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

/**
 * Stores primary session token.
 */
export function setToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Completely clears auth credentials & impersonation context.
 */
export function clearToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
  window.localStorage.removeItem(IMP_KEY);
}

export interface Impersonation {
  company_name: string;
  user_email: string;
}

/**
 * Safely initiates admin tenant impersonation mode.
 */
export function startImpersonation(token: string, info: Impersonation) {
  if (typeof window === "undefined") return;
  const current = getToken();
  if (current) window.localStorage.setItem(ADMIN_TOKEN_KEY, current);
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(IMP_KEY, JSON.stringify(info));
}

/**
 * Retrieves active impersonation metadata if present.
 */
export function getImpersonation(): Impersonation | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(IMP_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Impersonation;
  } catch {
    return null;
  }
}

/**
 * Restores original admin token after finishing impersonation.
 */
export function stopImpersonation(): boolean {
  if (typeof window === "undefined") return false;
  const admin = window.localStorage.getItem(ADMIN_TOKEN_KEY);
  window.localStorage.removeItem(IMP_KEY);
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
  if (admin) {
    window.localStorage.setItem(TOKEN_KEY, admin);
    return true;
  }
  return false;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
  raw?: BodyInit;
}

// Track 401 redirect attempt to avoid infinite loops
let isRedirectingToLogin = false;

/**
 * Enterprise API client wrapper with automatic token management,
 * error handling, and 401 session guard protection.
 */
export async function api<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, raw } = opts;
  const headers: Record<string, string> = {};

  if (auth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  let payload: BodyInit | undefined = raw;
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  try {
    const res = await fetch(`${BASE}${path}`, { method, headers, body: payload });

    if (res.status === 204) return undefined as T;

    const text = await res.text();
    let data: Record<string, unknown> | null = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!res.ok) {
      // 401 Unauthorized handling with anti-loop protection
      if (res.status === 401 && auth) {
        if (!isRedirectingToLogin && typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          if (currentPath !== "/login") {
            isRedirectingToLogin = true;
            clearToken();
            window.location.replace("/login");
          }
        }
      }

      const detail = data?.detail;
      const message = Array.isArray(detail) ? detail[0]?.msg : (typeof detail === "string" ? detail : res.statusText);
      throw new ApiError(res.status, message || `HTTP error ${res.status}`);
    }

    return data as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err instanceof Error ? err.message : "Network error");
  }
}
