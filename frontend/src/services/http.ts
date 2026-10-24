/**
 * Service transport layer.
 *
 * Every service function goes through here, so switching from mock data to the
 * real REST API is a one-line change (VITE_DATA_SOURCE=live). In mock mode we
 * resolve from the in-memory `db` after a small simulated latency; in live mode
 * we call the NestJS backend via fetch through the Vite `/api` proxy.
 *
 * SECURITY: no secrets ever live here. Only the JWT (issued by the backend) is
 * read from storage and sent as a Bearer token. Payment/DB credentials stay
 * server-side.
 */

export const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE ?? 'mock') as 'mock' | 'live';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
export const isMock = DATA_SOURCE !== 'live';

const TOKEN_KEY = 'k2k.token';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable — ignore */
  }
}

/** Error shape shared by mock + live paths, so the UI handles both the same way. */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Run a mock operation with human-feeling latency. `produce` may throw an
 * ApiError to simulate a failure (e.g. 404) — it surfaces as a rejected promise,
 * exactly like the live path.
 */
export async function mock<T>(produce: () => T, ms = 320): Promise<T> {
  const jitter = ms * (0.6 + Math.random() * 0.8);
  await delay(Math.round(jitter));
  return produce();
}

/** Live REST call — used when VITE_DATA_SOURCE=live and the backend is running. */
export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body.message ?? message;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(message, res.status);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

let idSeq = 1000;
/** Monotonic id for newly created mock records. */
export function nextId(prefix: string): string {
  idSeq += 1;
  return `${prefix}_${idSeq}`;
}
