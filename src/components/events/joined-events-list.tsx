"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  CalendarPlus,
  RefreshCw,
  UsersRound,
} from "lucide-react"

import { EventCard } from "@/components/events/event-card"
import { EventCardSkeleton } from "@/components/events/event-card-skeleton"
import { Button } from "@/components/ui/button"
import {
  EventsApiError,
  fetchJoinedEvents,
  type RecentEvent,
} from "@/lib/api/events"

type JoinedState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; events: RecentEvent[] }

const SKELETON_COUNT = 3

/**
 * Joined Events — events the signed-in user has joined, backed by the
 * persistent `event_joiners` relationship in MongoDB (no localStorage):
 * geometry-of-truth lives in the database, so the list is identical on every
 * device and survives sign-outs.
 */
export function JoinedEventsList() {
  const router = useRouter()

  const [state, setState] = useState<JoinedState>({ status: "loading" })
  const [requestKey, setRequestKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    fetchJoinedEvents(controller.signal)
      .then((events) => {
        if (!controller.signal.aborted) {
          setState({ status: "success", events })
        }
      })
      .catch((listError: unknown) => {
        if (controller.signal.aborted) return
        setState({
          status: "error",
          message:
            listError instanceof EventsApiError
              ? listError.message
              : "Something went wrong while loading your joined events.",
        })
      })

    return () => controller.abort()
  }, [requestKey])

  const events = state.status === "success" ? state.events : []

  return (
    <div aria-live="polite">
      {state.status === "loading" ? (
        <div role="status">
          <span className="sr-only">Loading your joined events…</span>
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <li key={index}>
                <EventCardSkeleton />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {state.status === "error" ? (
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center"
        >
          <p className="font-semibold">We couldn’t load your joined events</p>
          <p className="max-w-md text-sm text-muted-foreground">
            {state.message}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setState({ status: "loading" })
              setRequestKey((key) => key + 1)
            }}
            className="mt-1"
          >
            <RefreshCw data-icon="inline-start" />
            Try again
          </Button>
        </div>
      ) : null}

      {state.status === "success" && events.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-brand-sage/50 bg-brand-forest/5 px-6 py-14 text-center dark:bg-brand-sage/10">
          <span
            aria-hidden
            className="flex size-11 items-center justify-center rounded-full bg-brand-forest/10 text-brand-forest dark:bg-brand-sage/15 dark:text-brand-soft-sage"
          >
            <UsersRound className="size-5" />
          </span>

          <p className="max-w-md text-muted-foreground">
            You haven’t joined any events yet. Browse upcoming community drives
            and lend a hand.
          </p>

          <Button
            variant="default"
            size="sm"
            className="mt-1 bg-brand-forest text-brand-ivory hover:bg-brand-forest/90"
            onClick={() => router.push("/events")}
          >
            <CalendarPlus data-icon="inline-start" />
            Browse Upcoming Events
          </Button>
        </div>
      ) : null}

      {state.status === "success" && events.length > 0 ? (
        <>
          <p className="mb-6 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {events.length}
            </span>{" "}
            {events.length === 1 ? "event" : "events"} you have signed up for
            as a volunteer.
          </p>

          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <li key={event._id}>
                <EventCard event={event} />
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  )
}
