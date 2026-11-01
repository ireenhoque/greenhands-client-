/**
 * MongoDB client used by the Next.js app for AUTHENTICATION data only.
 *
 * The Express API (greenhands-server) owns its own MongoDB connection in
 * its own process (see greenhands-server/db/connection.js). A driver client
 * cannot be shared across processes, so the Next.js app necessarily needs
 * its own connection — but exactly ONE per process: this module is the
 * single shared client, created once and reused for the app's lifetime
 * (same pattern as the Express server's connection module).
 *
 * It is only used to store Better Auth's own collections (user, session,
 * account, verification) alongside the existing data in the same cluster.
 * The existing `events` collection and every Express endpoint stay untouched.
 *
 * Environment variables (configure in the Vercel dashboard for production;
 * never commit real values — .env* files are gitignored):
 *   MONGO_URI – connection string (required)
 *   DB_NAME   – database name (defaults to "greenhands")
 */
import "server-only"
import { MongoClient } from "mongodb"

const MONGO_URI = process.env.MONGO_URI?.trim()

/** Fail fast with an actionable message when auth is misconfigured. */
if (!MONGO_URI) {
  throw new Error(
    "MONGO_URI is not set — authentication needs a MongoDB connection. " +
      'Add it to .env.local (see .env.example), e.g. MONGO_URI=mongodb://localhost:27017, ' +
      "and set it in the Vercel dashboard for production."
  )
}

/** One client instance, reused for the whole lifetime of the Next.js process. */
export const mongoClient = new MongoClient(MONGO_URI)

/**
 * Database holding Better Auth's collections. Defaults to the same database
 * the Express API uses ("greenhands"); auth tables are in their own
 * collections (`user`, `session`, `account`, `verification`), so they never
 * collide with the existing `events` collection.
 */
export const mongoDb = mongoClient.db(process.env.DB_NAME?.trim() || "greenhands")
