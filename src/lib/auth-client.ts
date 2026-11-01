/**
 * Client-side Better Auth instance — used by the login and sign-up forms
 * and the navbar's sign-out control.
 *
 * The auth API lives on this same origin (`/api/auth/*` route handler), so
 * the client derives its base URL from the browser's current origin and
 * nothing is hardcoded to localhost — identical code runs on any deployment
 * domain. Set NEXT_PUBLIC_BETTER_AUTH_URL only if auth were ever served from
 * a different origin.
 */
import { createAuthClient } from "better-auth/react"

const authBaseURL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL?.trim()

export const authClient = createAuthClient(authBaseURL ? { baseURL: authBaseURL } : {})
