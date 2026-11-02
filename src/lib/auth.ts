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
import { jwt } from "better-auth/plugins/jwt"
import { mongodbAdapter } from "@better-auth/mongo-adapter"
import { mongoClient, mongoDb } from "./mongo"

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID?.trim()
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET?.trim()

// Canonical auth origin. Used as the JWT issuer/audience and for the Google
// OAuth callback base. Trailing slashes are stripped the same way Better
// Auth normalizes baseURL, so the issuer always matches what the Express
// server derives from its own env config when verifying tokens.
const AUTH_URL = process.env.BETTER_AUTH_URL?.trim().replace(/\/+$/, "") || undefined

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
  baseURL: AUTH_URL,

  emailAndPassword: {
    enabled: true,
    // The register form enforces the assignment policy (min 6 chars with
    // upper + lowercase); lower the server default of 8 so compliant
    // 6–7 character passwords are not rejected here.
    minPasswordLength: 6,
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

  plugins: [
    // Official Better Auth JWT plugin (better-auth@1.7.14):
    // - GET /api/auth/token → mints a short-lived (15 min) JWT for the
    //   current session (data conveyed by the session cookie). The frontend
    //   caches it in-memory and sends it to protected Express endpoints as
    //   `Authorization: Bearer <jwt>` — see src/lib/api/auth-bearer.ts.
    // - GET /api/auth/jwks → publishes the public verifying keys, which the
    //   Express API fetches for verification (greenhands-server/db/jwt.js).
    // Signing keys (an Ed25519 key pair) live in Better Auth's own `jwks`
    // collection in the shared MongoDB cluster, encrypted with
    // BETTER_AUTH_SECRET — no additional secrets are introduced.
    //
    // iss/aud are pinned to the configured origin so the Express server can
    // check them against its own BETTER_AUTH_URL-derived expectations.
    jwt({
      jwt: {
        issuer: AUTH_URL,
        audience: AUTH_URL,
      },
    }),
    // Must stay LAST — it forwards auth Set-Cookie headers in Server Actions.
    nextCookies(),
  ],
})
