import { Suspense } from "react"
import { redirect } from "next/navigation"

import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { getSession } from "@/lib/session"

/**
 * Dashboard shell.
 *
 * - Auth gate: only signed-in users see dashboard pages. The gate is an
 *   async server check (the ONE module that touches the session is
 *   src/lib/session.ts); guests are sent to the login page, which returns
 *   them here after signing in.
 * - The gate runs inside <Suspense> because the session read is a
 *   request-time read (cacheComponents) and cannot be prerendered.
 * - Navigation: horizontal section nav shared by all dashboard pages with
 *   active-page highlighting (see dashboard-nav.tsx).
 */
function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
      <DashboardNav />
      <div className="pt-8">{children}</div>
    </div>
  )
}

/** Matches the shell footprint while the session check resolves. */
function DashboardFallback({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
      <div className="h-10 w-72 animate-pulse rounded-full bg-muted" />
      <div className="pt-8">{children}</div>
    </div>
  )
}

async function DashboardGate({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session) {
    redirect("/login?returnUrl=%2Fdashboard%2Fmanage-events")
  }

  return <DashboardShell>{children}</DashboardShell>
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background">
      <Suspense fallback={<DashboardFallback>{children}</DashboardFallback>}>
        <DashboardGate>{children}</DashboardGate>
      </Suspense>
    </main>
  )
}
