/**
 * Better Auth endpoints, mounted under /api/auth/*:
 *
 *   POST /api/auth/sign-up/email       email + password sign-up
 *   POST /api/auth/sign-in/email       email + password sign-in
 *   GET  /api/auth/sign-in/social      start Google (or other) OAuth
 *   POST /api/auth/sign-out            end the session
 *   GET  /api/auth/get-session         current session for the client
 *   GET  /api/auth/callback/google     OAuth callback
 *                                      ({BETTER_AUTH_URL}/api/auth/callback/google)
 *
 * Auth handlers read request headers/cookies, so they always run at request
 * time (never prerendered or cached).
 */
import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

export const { GET, POST } = toNextJsHandler(auth)
