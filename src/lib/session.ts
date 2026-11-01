/**
 * Server-side session access, backed by Better Auth.
 *
 * This is the ONE module that touches the auth session on the server; the
 * navbar and hero read it so exactly one place changes if the auth stack
 * ever does.
 *
 * Callers MUST await this inside a <Suspense> boundary: with `cacheComponents`
 * enabled, reading the session cookie is a request-time read and cannot be
 * prerendered into the static shell (reading cookies outside a boundary is a
 * build error).
 *
 * Sign-out lives in the client (src/lib/auth-client.ts → authClient.signOut()).
 */
import "server-only"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

export type SessionUser = {
  id: string
  name: string
  email?: string | null
  /** Optional avatar URL (may come from the auth provider). */
  image?: string | null
}

export type Session = { user: SessionUser } | null

/**
 * Reads the authentic Better Auth session for the current request — null
 * when logged out. Projects the narrow SessionUser shape (> just the fields
 * the UI needs) so no auth internals leak into components.
 */
export async function getSession(): Promise<Session> {
  const serverSession = await auth.api.getSession({ headers: await headers() })

  if (!serverSession) {
    return null
  }

  const { user } = serverSession
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image ?? null,
    },
  }
}
