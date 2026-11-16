/* Sign-in, sign-out and the session token the backend keeps in a JS-readable cookie. */
import { api } from "@/lib/api";
import type { LoginInput } from "@/types/api";
import type { CurrentUser, SessionClaims } from "@/types/user";
import { initials } from "@/utils/initials";

const SESSION_COOKIE = "session_token";
/** Treat a token this close to expiry as expired, so it doesn't lapse mid-request. */
const EXPIRY_LEEWAY_MS = 10_000;

export async function login(input: LoginInput): Promise<void> {
  await api.post("/auth/login", input);
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

/** Exchange the (httpOnly) refresh cookie for a new session cookie. Throws if it's
    missing, expired, revoked, or the account is deactivated. */
export async function refreshSession(): Promise<void> {
  await api.post("/auth/refresh");
}

type SessionToken = SessionClaims & { exp: number };

function decodeJwtPayload(token: string): unknown {
  const part = token.split(".")[1];
  if (!part) return null;
  const base64 = part.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(part.length / 4) * 4, "=");
  const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

/** The session token's claims, or null if the cookie is missing or unreadable. The
    backend verifies the token; the frontend only reads it for display and routing. */
export function readSessionToken(): SessionToken | null {
  const raw = document.cookie.split("; ").find(c => c.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1);
  if (!raw) return null;
  try {
    const claims = decodeJwtPayload(decodeURIComponent(raw)) as SessionToken | null;
    return claims?.id && claims.role && typeof claims.exp === "number" ? claims : null;
  } catch {
    return null;
  }
}

/** `exp` is in seconds since the epoch (JWT standard). */
export function isSessionExpired(token: SessionToken, now = Date.now()): boolean {
  return token.exp * 1000 - EXPIRY_LEEWAY_MS <= now;
}

export function toCurrentUser(claims: SessionClaims): CurrentUser {
  const name = `${claims.firstName} ${claims.lastName}`.trim();
  return { id: claims.id, email: claims.email, firstName: claims.firstName, lastName: claims.lastName, role: claims.role, name, initials: initials(name) };
}
