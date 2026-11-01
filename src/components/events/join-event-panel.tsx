"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Heart, HeartOff, Loader2, UsersRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  EventsApiError,
  fetchJoinState,
  joinEvent,
  leaveEvent,
} from "@/lib/api/events"

type JoinState = {
  joined: boolean
  joinerCount: number
}

type JoinPanelProps = {
  eventId: string
  /** Whether the viewer has a session (server-resolved before render). */
  signedIn: boolean
}

/**
 * Sidebar join panel on the event details page (reference: "N Volunteers
 * Joined … Join Event").
 *
 * - Guests see the volunteer count and the sign-in CTA (returning to this
 *   event after logging in — the pre-existing behavior).
 * - Signed-in users join/leave via the API-backed relationship. The state
 *   persists in MongoDB (`event_joiners`), so refreshes and other devices
 *   agree.
 * - First render streams the count + joined state from GET …/join-state.
 */
export function JoinEventPanel({ eventId, signedIn }: JoinPanelProps) {
  const router = useRouter()

  const [state, setState] = useState<JoinState | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    fetchJoinState(eventId, controller.signal)
      .then((joinState) => {
        if (!controller.signal.aborted) setState(joinState)
      })
      .catch((loadFailure: unknown) => {
        if (controller.signal.aborted) return
        setLoadError(
          loadFailure instanceof EventsApiError
            ? loadFailure.message
            : "Could not load the volunteer count."
        )
      })

    return () => controller.abort()
  }, [eventId])

  async function toggleJoin() {
    if (pending) return

    setPending(true)
    setActionError(null)

    try {
      const next =
        state?.joined === true
          ? await leaveEvent(eventId)
          : await joinEvent(eventId)

      setState(next)
      router.refresh()
    } catch (joinFailure) {
      setActionError(
        joinFailure instanceof EventsApiError
          ? joinFailure.message
          : "Something went wrong while updating your participation."
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mt-7 border-t border-border/70 pt-6">
      {/* Volunteer count (reference row) */}
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft-sage text-brand-forest dark:bg-brand-sage/15 dark:text-brand-soft-sage"
        >
          <UsersRound className="size-5" />
        </span>

        <div>
          <p className="text-sm font-semibold text-foreground" aria-live="polite">
            {state === null
              ? loadError
                ? "Volunteer count unavailable"
                : "Loading…"
              : `${state.joinerCount} ${
                  state.joinerCount === 1 ? "Volunteer" : "Volunteers"
                } Joined`}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Sign up to join hands for this initiative
          </p>
        </div>
      </div>

      {/* Action area */}
      {signedIn && state !== null ? (
        <div className="mt-5">
          <Button
            onClick={toggleJoin}
            disabled={pending}
            size="lg"
            className={
              state.joined
                ? "w-full"
                : "w-full bg-brand-forest text-brand-ivory hover:bg-brand-forest/90"
            }
          >
            {pending ? (
              <Loader2 data-icon="inline-start" aria-hidden className="animate-spin" />
            ) : state.joined ? (
              <HeartOff data-icon="inline-start" />
            ) : (
              <Heart data-icon="inline-start" />
            )}
            {state.joined ? "Leave Event" : "Join Event"}
          </Button>

          {actionError ? (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {actionError}
            </p>
          ) : null}
        </div>
      ) : null}

      {signedIn && state === null && !loadError ? (
        <Button size="lg" disabled className="mt-5 w-full">
          <Loader2 data-icon="inline-start" aria-hidden className="animate-spin" />
          Loading…
        </Button>
      ) : null}

      {!signedIn ? (
        <>
          <Link
            href={`/login?returnUrl=${encodeURIComponent(`/events/${eventId}`)}`}
            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-forest px-5 text-sm font-medium text-brand-ivory transition-colors hover:bg-brand-forest/90"
          >
            <Heart aria-hidden className="size-4" />
            Join Event
          </Link>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Sign in to participate in this event.
          </p>
        </>
      ) : null}
    </div>
  )
}
