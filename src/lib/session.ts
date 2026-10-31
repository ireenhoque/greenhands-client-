/**
 * Auth session seam for the navbar and hero.
 *
 * This project does not have an auth provider wired up yet — there is no
 * Better Auth (or any auth) package installed, no auth client, and no session
 * utilities anywhere in the codebase. Rather than inventing a mock
 * authentication system, the auth-aware UI reads the current user through this
 * single module so exactly ONE place changes when real auth lands.
 *
 * To integrate Better Auth later:
 *   1. Replace `getSession()` with the server-side session lookup, e.g.
 *        const session = await auth.api.getSession({ headers: await headers() })
 *      and make its callers await it (or read the session once in the root
 *      layout and pass it down).
 *   2. Replace `signOut()` with `authClient.signOut({ ... })`.
 *   3. Login links already point at /login?returnUrl=<current path> — keep or
 *      rename the query param to match your login page.
 */
export type SessionUser = {
  id: string
  name: string
  email?: string | null
  /** Optional avatar URL (may come from the auth provider). */
  image?: string | null
}

export type Session = { user: SessionUser } | null

/**
 * Returns the active session, or null when logged out.
 *
 * Always null until an auth provider is installed — this is NOT mock data;
 * it is the honest "no authenticated user" state.
 */
export function getSession(): Session {
  // TODO(auth): return the real Better Auth session here.
  return null
}

/** Ends the current session. No-op until an auth provider is installed. */
export async function signOut(): Promise<void> {
  // TODO(auth): call authClient.signOut() here, then refresh the router.
}
