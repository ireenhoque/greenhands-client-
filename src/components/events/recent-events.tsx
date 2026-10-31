"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  AlertCircle,
  ArrowRight,
  CalendarX2,
  RefreshCw,
} from "lucide-react"

import { EventCard } from "@/components/events/event-card"
import { EventCardSkeleton } from "@/components/events/event-card-skeleton"
import { Button } from "@/components/ui/button"
import { fetchRecentEvents, type RecentEvent } from "@/lib/api/events"

type EventsState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; events: RecentEvent[] }

const SKELETON_COUNT = 6

function EventGrid({ children }: { children: React.ReactNode }) {
  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </ul>
  )
}

/**
 * "Upcoming Opportunities to Make a Difference" section.
 *
 * Fetches GET /events/recent once through the shared API utility and renders
 * skeletons while loading, a meaningful error panel (with retry) on failure,
 * the empty-state message when the API returns no events, or up to 6 cards.
 */
export function RecentEvents() {
  const [requestKey, setRequestKey] = useState(0)
  const [state, setState] = useState<EventsState>({ status: "loading" })

  useEffect(() => {
    const controller = new AbortController()

    fetchRecentEvents(controller.signal)
      .then((events) => {
        if (!controller.signal.aborted) {
          setState({ status: "success", events })
        }
      })
      .catch((error: unknown) => {
        // Ignore cancellations caused by unmount/retry — not real failures.
        if (controller.signal.aborted) return
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Something went wrong while loading upcoming events.",
        })
      })

    return () => controller.abort()
  }, [requestKey])

  function retry() {
    setState({ status: "loading" })
    setRequestKey((key) => key + 1)
  }

  return (
    <section
      aria-labelledby="upcoming-events-heading"
      className="mx-auto w-full max-w-6xl px-4 py-16 md:py-20"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h2
            id="upcoming-events-heading"
            className="text-balance text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Upcoming Opportunities to Make a Difference
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground md:text-lg">
            Discover meaningful community-service initiatives and find your next
            opportunity to help.
          </p>
        </div>

        <Link
          href="/events"
          className="group/view-all inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-forest transition-colors hover:text-brand-sage dark:text-brand-soft-sage dark:hover:text-brand-gold"
        >
          View All Events
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform group-hover/view-all:translate-x-0.5"
          />
        </Link>
      </div>

      {/* aria-live announces state changes (loaded / failed) to assistive tech */}
      <div aria-live="polite" className="mt-10">
        {state.status === "loading" && (
          <div role="status">
            <span className="sr-only">Loading upcoming events…</span>
            <EventGrid>
              {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                <li key={index}>
                  <EventCardSkeleton />
                </li>
              ))}
            </EventGrid>
          </div>
        )}

        {state.status === "error" && (
          <div
            role="alert"
            className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center"
          >
            <span
              aria-hidden
              className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive"
            >
              <AlertCircle className="size-5" />
            </span>
            <div>
              <p className="font-semibold">We couldn’t load upcoming events</p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {state.message}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={retry}
              className="mt-1"
            >
              <RefreshCw data-icon="inline-start" />
              Try again
            </Button>
          </div>
        )}

        {state.status === "success" && state.events.length === 0 && (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-brand-sage/50 bg-brand-forest/5 px-6 py-14 text-center dark:bg-brand-sage/10">
            <span
              aria-hidden
              className="flex size-11 items-center justify-center rounded-full bg-brand-forest/10 text-brand-forest dark:bg-brand-sage/15 dark:text-brand-soft-sage"
            >
              <CalendarX2 className="size-5" />
            </span>
            <p className="max-w-md text-muted-foreground">
              No upcoming events right now. Check back soon to discover new
              community initiatives.
            </p>
          </div>
        )}

        {state.status === "success" && state.events.length > 0 && (
          <EventGrid>
            {state.events.map((event) => (
              <li key={event._id}>
                <EventCard event={event} />
              </li>
            ))}
          </EventGrid>
        )}
      </div>
    </section>
  )
}
