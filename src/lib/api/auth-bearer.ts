/**
 * JWT bearer-token acquisition for the protected Express API endpoints.
 *
 * The token comes from Better Auth's official JWT plugin (registered in
 * src/lib/auth.ts): GET /api/auth/token returns a short-lived, signed JWT
 * for the CURRENT session. The token is never stored in localStorage — it
 * only lives in this module's in-memory cache, mirroring the session it is
 * based on, and is re-fetched automatically when it expires.
 *
 * Behavior contract (used by src/lib/api/events.ts):
 * - Signed-out visitor → null (callers proceed without an Authorization
 *   header; the server answers 401 exactly as before).
 * - Signed-in → "Bearer <jwt>" value, cached until `exp` minus a safety
 *   margin so concurrent requests share one token request instead of
 *   hammering /api/auth/token.
 * - A token known to be expired is dropped and re-fetched once per caller.
 */
import { authClient } from "@/lib/auth-client"

/** Refresh this long before the server could reject the token. */
const MIN_LIFETIME_MS = 60_000

/** Unknown token lifetime — cache briefly, then re-fetch. */
const UNKNOWN_LIFETIME_MS = 30_000

let cachedToken: { token: string; cachedUntil: number } | null = null
let signedOutUntil = 0
let inflight: Promise<string | null> | null = null

/**
 * Decodes the JWT payload's "exp" (seconds since epoch) into milliseconds.
 * Returns 0 when the payload cannot be parsed — callers then use the short
 * cache window instead of trusting a wrong lifetime.
 */
function tokenExpiry(token: string): number {
  const parts = token.split(".")
  if (parts.length !== 3) return 0

  let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
  base64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=")

  try {
    const payload = JSON.parse(atob(base64)) as { exp?: unknown }
    return typeof payload.exp === "number" ? payload.exp * 1000 : 0
  } catch {
    return 0
  }
}

/**
 * Fetches a fresh JWT from the Better Auth token endpoint. Returns null when
 * there is no session (401) or the auth API is unreachable — never throws,
 * so the calling API helper degrades to the previous cookie-only behavior.
 */
async function requestToken(): Promise<string | null> {
  const { data } = await authClient.$fetch<{ token: string }>("/token", {
    method: "GET",
    // Same origin as the auth API; explicit so it also holds when auth is
    // served from a different origin via NEXT_PUBLIC_BETTER_AUTH_URL.
    credentials: "include",
  })

  const token = data?.token
  if (!token) {
    // No session (or the endpoint is unavailable): remember briefly so
    // guest visitors do not fire a doomed /token request on every call.
    signedOutUntil = Date.now() + UNKNOWN_LIFETIME_MS
    return null
  }

  const expiry = tokenExpiry(token)
  // Cache until expiry minus a safety margin (or briefly when unknown).
  const lifetime =
    expiry > 0 ? expiry - Date.now() - MIN_LIFETIME_MS : UNKNOWN_LIFETIME_MS
  cachedToken = { token, cachedUntil: Date.now() + Math.max(lifetime, 0) }

  return token
}

/**
 * Returns a valid bearer token for the current session, or null when signed
 * out. Concurrent callers share one in-flight request.
 *
 * `forceRefresh` re-checks after a failed request so a user who just signed
 * in (or recovered from a transient auth-API failure) gets a fresh token
 * instead of a stale negative result.
 */
export async function getJwtToken(forceRefresh = false): Promise<string | null> {
  const now = Date.now()

  if (forceRefresh) {
    signedOutUntil = 0
  } else {
    if (signedOutUntil > now) return null
    if (cachedToken && cachedToken.cachedUntil > now) return cachedToken.token
  }

  inflight ??= requestToken().finally(() => {
    inflight = null
  })

  return inflight
}

/** Drops the cached token so the next getJwtToken() fetches a fresh one. */
export function clearJwtToken() {
  cachedToken = null
  signedOutUntil = 0
}
