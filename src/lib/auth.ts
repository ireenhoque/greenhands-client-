/**
 * Server-side Better Auth instance.
 *
 * - Database: the same MongoDB cluster the Express API uses, via Better
 *   Auth's official Mongo adapter (own collections only — see lib/mongo.ts).
 * - Methods: email + password always; Google sign-in when its env vars are set.
 * - nextCookies: lets Server Actions set auth cookies (server components
 *   cannot set cookies on their own) — keep it last in `plugins`.
 *
 * Environment variables (all configurable in the Vercel dashboard):
 *   BETTER_AUTH_URL          — absolute app origin, e.g. http://localhost:3000
 *                              or https://greenhands.vercel.app. Also fixes
 *                              the OAuth callback base:
 *                              {BETTER_AUTH_URL}/api/auth/callback/google
 *   BETTER_AUTH_SECRET       — 32+ char random secret (Vercel: `vercel env add`)
 *   GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET — optional; enables Google sign-in
 *   MONGO_URI / DB_NAME      — see lib/mongo.ts
 *
 * Cookie security: Better Auth defaults apply — httpOnly sessions, `secure`
 * when serving over HTTPS (production on Vercel), sameSite "lax".
 */
import "server-only"
import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { mongodbAdapter } from "@better-auth/mongo-adapter"
import { mongoClient, mongoDb } from "./mongo"

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID?.trim()
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET?.trim()

// Google sign-in is only registered when BOTH credentials exist, so a dev
// machine (or preview build) without OAuth creds keeps email/password working.
const socialProviders = {
  ...(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET
    ? { google: { clientId: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET } }
    : {}),
}

export const auth = betterAuth({
  database: mongodbAdapter(mongoDb, {
    // The Atlas cluster is a replica set/sharded cluster, so passing the
    // client enables transactions for multi-document auth writes.
    client: mongoClient,
  }),

  // Configured origin wins; Better Auth falls back to the incoming request
  // host when this env var is not set. Set it explicitly in production.
  baseURL: process.env.BETTER_AUTH_URL?.trim() || undefined,

  emailAndPassword: {
    enabled: true,
  },

  socialProviders,

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      // In this version, implicit linking also requires the EXISTING local
      // user row to have `emailVerified: true` (`requireLocalEmailVerified`
      // defaults to true). Users whose row was created by email/password
      // signup are `emailVerified: false` until verified, so their first
      // Google sign-in failed with `account_not_linked` even though Google
      // is trusted and always returns a verified email. Setting false
      // restores the intended trusted-provider link; Better Auth itself
      // then flips `emailVerified` to true on the matching Google sign-in —
      // no manual DB edit needed.
      // Note: marked deprecated upstream and scheduled for removal on the
      // next minor — revisit if better-auth is ever upgraded past 1.7.x.
      requireLocalEmailVerified: false,
    }
  },

  advanced: {
    database: {
      // Fetch user + session in one round trip instead of two (MongoDB
      // adapter supports joins since 1.4.0).
      joins: true,
    },
  },

  // Must stay last — it forwards auth Set-Cookie headers in Server Actions.
  plugins: [nextCookies()],
})
