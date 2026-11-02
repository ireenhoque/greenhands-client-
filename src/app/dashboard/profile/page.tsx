import { Suspense } from "react"
import { redirect } from "next/navigation"
import { UserRound } from "lucide-react"

import { ProfileView } from "@/components/profile/profile-view"
import { Skeleton } from "@/components/ui/skeleton"
import { getSession } from "@/lib/session"

/**
 * Matches the loaded ProfileView's footprint while the auth gate resolves —
 * avatar circle, name/email line, then the two form fields and the save
 * button — so the page does not shift when the real card streams in.
 */
function ProfileFallback() {
  return (
    <div
      aria-hidden
      className="mt-10 rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-10"
    >
      <div className="flex items-center gap-4">
        <Skeleton className="size-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56 max-w-full" />
        </div>
      </div>

      <div className="mt-10 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
    </div>
  )
}

/**
 * Auth gate (server-side): guests are sent to the login page and returned
 * here after signing in, exactly like the other dashboard routes. The view
 * itself loads its session through the Better Auth client hook, so an
 * updated profile is reflected immediately without a full reload.
 */
async function ProfileContent() {
  const session = await getSession()

  if (!session) {
    redirect("/login?returnUrl=%2Fdashboard%2Fprofile")
  }

  return <ProfileView />
}

/**
 * Profile — dashboard route /dashboard/profile.
 *
 * Shows the authenticated user's Better Auth profile (avatar, name, email —
 * no duplicate profile storage; Better Auth's `user` collection is the
 * single source of truth) and lets the user update their name and profile
 * picture (see profile-view.tsx / auth.ts — the update goes through
 * Better Auth's signed-in session, so users can only ever change their own
 * profile).
 */
export default function ProfilePage() {
  return (
    <div>
      {/* Header */}
      <div className="max-w-2xl">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-sage">
          <UserRound aria-hidden className="size-3.5" />
          Account
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          My Profile
        </h1>

        <p className="mt-3 text-muted-foreground">
          How you appear to event volunteers across GreenHands. Your name and
          picture are shown next to the community drives you organize.
        </p>
      </div>

      {/* Profile card (streams behind the session gate) */}
      <Suspense fallback={<ProfileFallback />}>
        <ProfileContent />
      </Suspense>
    </div>
  )
}
