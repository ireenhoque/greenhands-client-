import { Suspense } from "react"
import Link from "next/link"
import { ArrowLeft, CalendarDays, CalendarPlus, Leaf } from "lucide-react"

import { fetchUpcomingEvents, EventsApiError } from "@/lib/api/events"
import { EventsFilter } from "@/components/events/events-filter"
import { getSession } from "@/lib/session"

async function EventsContent() {
  let events = null
  let errorMessage: string | null = null

  // Request-time reads (events API + signed-in state) below — this block
  // streams inside the page's <Suspense> boundary.
  let signedIn = false

  try {
    const [upcomingEvents, session] = await Promise.all([
      fetchUpcomingEvents(),
      getSession(),
    ])
    events = upcomingEvents
    signedIn = Boolean(session)
  } catch (error) {
    errorMessage =
      error instanceof EventsApiError
        ? error.message
        : "Something went wrong while loading events."
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      {errorMessage ? (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6"
        >
          <h2 className="font-semibold text-foreground">
            Unable to load events
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {errorMessage}
          </p>
        </div>
      ) : events && events.length > 0 ? (
        <>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Find your next opportunity
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Explore events happening in your community.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="rounded-full border border-brand-sage/30 bg-brand-soft-sage/40 px-3 py-1 text-sm font-medium text-brand-forest dark:bg-brand-sage/10 dark:text-brand-soft-sage">
                {events.length} {events.length === 1 ? "event" : "events"}
              </span>

              {signedIn ? (
                <Link
                  href="/dashboard/create-event"
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-forest px-4 py-2 text-sm font-medium text-brand-ivory transition-colors hover:bg-brand-forest/90"
                >
                  <CalendarPlus aria-hidden className="size-4" />
                  Create Event
                </Link>
              ) : null}
            </div>
          </div>

          <EventsFilter events={events} />
        </>
      ) : (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-brand-sage/40 bg-brand-soft-sage/20 px-6 py-16 text-center dark:bg-brand-forest/10">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft-sage text-brand-forest dark:bg-brand-sage/15 dark:text-brand-soft-sage">
            <Leaf className="size-7" />
          </span>

          <h2 className="mt-5 text-xl font-semibold text-foreground">
            No upcoming events yet
          </h2>

          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            There are no upcoming events at the moment. Check back soon to
            discover new ways to make a difference.
          </p>

          <Link
            href="/"
            className="mt-6 rounded-lg bg-brand-forest px-5 py-2.5 text-sm font-medium text-brand-ivory transition-colors hover:bg-brand-forest/90"
          >
            Return Home
          </Link>
        </div>
      )}
    </section>
  )
}

function EventsLoading() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <div className="mb-8 space-y-2">
        <div className="h-6 w-64 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded-md bg-muted" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-border"
          >
            <div className="aspect-[16/10] animate-pulse bg-muted" />

            <div className="space-y-3 p-5">
              <div className="h-5 w-3/4 animate-pulse rounded-md bg-muted" />
              <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Page header */}
      <section className="border-b border-brand-sage/20 bg-brand-soft-sage/30 dark:bg-brand-forest/10">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-brand-forest dark:hover:text-brand-soft-sage"
          >
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>

          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-forest text-brand-ivory">
              <CalendarDays className="size-6" />
            </span>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-sage">
                Make a Difference
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-brand-forest dark:text-brand-soft-sage sm:text-4xl">
                Upcoming Events
              </h1>
            </div>
          </div>

          <p className="mt-5 max-w-2xl text-muted-foreground">
            Join hands with your community. Discover upcoming activities,
            volunteer opportunities, and meaningful ways to create positive
            change.
          </p>
        </div>
      </section>

      {/* Events */}
      <Suspense fallback={<EventsLoading />}>
        <EventsContent />
      </Suspense>
    </main>
  )
}