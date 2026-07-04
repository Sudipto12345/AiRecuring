const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const TOKEN_KEY = "airecruit_token";
const ADMIN_TOKEN_KEY = "airecruit_admin_token";
const IMP_KEY = "airecruit_impersonation";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
  window.localStorage.removeItem(IMP_KEY);
}

export interface Impersonation {
  company_name: string;
  user_email: string;
}

// swap tenant token while super-admin is "viewing as" company
export function startImpersonation(token: string, info: Impersonation) {
  const current = getToken();
  if (current) window.localStorage.setItem(ADMIN_TOKEN_KEY, current);
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(IMP_KEY, JSON.stringify(info));
}

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

// put the admin token back
export function stopImpersonation(): boolean {
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
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
  raw?: BodyInit;
}

export async function api<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, raw } = opts;
  const headers: Record<string, string> = {};

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let payload: BodyInit | undefined = raw;
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const res = await fetch(`${BASE}${path}`, { method, headers, body: payload });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const detail = data?.detail;
    const message = Array.isArray(detail) ? detail[0]?.msg : detail || res.statusText;
    throw new ApiError(res.status, message || "request blew up");
  }
  return data as T;
}
