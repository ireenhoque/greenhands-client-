import Link from "next/link"
import { ArrowLeft, CalendarDays, Leaf } from "lucide-react"

import { EventCard } from "@/components/events/event-card"
import { fetchUpcomingEvents, EventsApiError } from "@/lib/api/events"

export default async function EventsPage() {
  let events = null
  let errorMessage: string | null = null

  try {
    events = await fetchUpcomingEvents()
  } catch (error) {
    errorMessage =
      error instanceof EventsApiError
        ? error.message
        : "Something went wrong while loading events."
  }

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

              <span className="rounded-full border border-brand-sage/30 bg-brand-soft-sage/40 px-3 py-1 text-sm font-medium text-brand-forest dark:bg-brand-sage/10 dark:text-brand-soft-sage">
                {events.length} {events.length === 1 ? "event" : "events"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
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
    </main>
  )
}