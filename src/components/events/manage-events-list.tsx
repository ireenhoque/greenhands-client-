"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  CalendarDays,
  CalendarPlus,
  Loader2,
  MapPin,
  Pencil,
  RefreshCw,
  SquareArrowOutUpRight,
  Trash2,
  UsersRound,
} from "lucide-react"

import { EventCardSkeleton } from "@/components/events/event-card-skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "cn"
import {
  deleteEvent,
  EventsApiError,
  fetchMyEvents,
  type RecentEvent,
} from "@/lib/api/events"

type ManageEvent = RecentEvent & { joinerCount?: number }

type ManageState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; events: ManageEvent[] }

const SKELETON_COUNT = 3

function formatDate(isoDate: string): string | null {
  const date = new Date(isoDate)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

/**
 * One organizer card per event.
 *
 * Navigation uses styled Link elements instead of Base UI Button with
 * render={<Link />}. Action buttons remain native buttons.
 */
function ManageEventCard({
  event,
  deleting,
  onDelete,
}: {
  event: ManageEvent
  deleting: boolean
  onDelete: () => void
}) {
  const dateLabel = formatDate(event.eventDate)

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all hover:border-brand-sage/60 hover:shadow-md">
      {/* Thumbnail with overlaid date chip */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-brand-forest/10">
        {event.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.imageUrl}
            alt={event.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : null}

        {event.eventType ? (
          <Badge className="absolute left-4 top-4 border-white/10 bg-brand-forest text-brand-ivory">
            {event.eventType}
          </Badge>
        ) : null}

        {dateLabel ? (
          <span className="absolute bottom-3 left-4 inline-flex items-center gap-1.5 rounded-lg bg-black/65 px-2.5 py-1 text-xs font-medium text-white">
            <CalendarDays aria-hidden className="size-3.5" />
            {dateLabel}
          </span>
        ) : null}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="line-clamp-2 text-lg leading-snug font-semibold tracking-tight text-foreground">
          {event.title}
        </h3>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {event.description?.trim() || "No description provided."}
        </p>

        <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          {event.location ? (
            <li className="flex items-start gap-2">
              <MapPin
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-brand-sage"
              />
              <span className="line-clamp-1">{event.location}</span>
            </li>
          ) : null}
        </ul>

        {typeof event.joinerCount === "number" ? (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <UsersRound aria-hidden className="size-3.5 text-brand-gold" />
            {event.joinerCount}{" "}
            {event.joinerCount === 1 ? "volunteer" : "volunteers"} joined
          </p>
        ) : null}

        {/* Actions pinned to the bottom */}
        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border/70 pt-4">
          {/* View: navigation link */}
          <Link
            href={`/events/${event._id}`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-muted-foreground hover:text-foreground"
            )}
          >
            <SquareArrowOutUpRight data-icon="inline-start" />
            View
          </Link>

          {/* Edit: navigation link */}
          <Link
            href={`/dashboard/edit-event/${event._id}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "border-brand-sage/60 text-brand-forest hover:bg-brand-forest hover:text-brand-ivory dark:text-brand-soft-sage dark:hover:bg-brand-sage/20"
            )}
          >
            <Pencil data-icon="inline-start" />
            Edit
          </Link>

          {/* Delete: action button inside AlertDialog */}
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  disabled={deleting}
                  className="border-destructive/40 text-destructive hover:border-destructive hover:bg-destructive hover:text-white"
                >
                  {deleting ? (
                    <>
                      <Loader2
                        data-icon="inline-start"
                        aria-hidden
                        className="animate-spin"
                      />
                      Deleting…
                    </>
                  ) : (
                    <>
                      <Trash2 data-icon="inline-start" />
                      Delete
                    </>
                  )}
                </Button>
              }
            />

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete “{event.title}”?
                </AlertDialogTitle>

                <AlertDialogDescription>
                  This permanently removes the event for everyone, including{" "}
                  {typeof event.joinerCount === "number" &&
                  event.joinerCount > 0
                    ? `the ${event.joinerCount} volunteers who joined`
                    : "any volunteers who joined"}
                  . This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>

                <AlertDialogAction onClick={onDelete}>
                  <Trash2 data-icon="inline-start" />
                  Delete event
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </article>
  )
}

/**
 * Manage Events — the organizer's own list only.
 *
 * GET /events/mine is enforced server-side by the verified session.
 * Deletion asks for confirmation, and the backend rejects deleting
 * another organizer's event with 403.
 */
export function ManageEventsList() {
  const router = useRouter()

  const [state, setState] = useState<ManageState>({
    status: "loading",
  })
  const [requestKey, setRequestKey] = useState(0)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    fetchMyEvents(controller.signal)
      .then((events) => {
        if (!controller.signal.aborted) {
          setState({
            status: "success",
            events,
          })
        }
      })
      .catch((listError: unknown) => {
        if (controller.signal.aborted) {
          return
        }

        setState({
          status: "error",
          message:
            listError instanceof EventsApiError
              ? listError.message
              : "Something went wrong while loading your events.",
        })
      })

    return () => controller.abort()
  }, [requestKey])

  async function handleDelete(id: string) {
    setDeletingId(id)
    setDeleteError(null)

    try {
      await deleteEvent(id)

      // Remove the deleted event from the local list.
      setState((currentState) => {
        if (currentState.status !== "success") {
          return currentState
        }

        return {
          status: "success",
          events: currentState.events.filter((event) => event._id !== id),
        }
      })

      router.refresh()
    } catch (deleteFailure: unknown) {
      setDeleteError(
        deleteFailure instanceof EventsApiError
          ? deleteFailure.message
          : "Something went wrong while deleting the event."
      )
    } finally {
      setDeletingId(null)
    }
  }

  const events = state.status === "success" ? state.events : []

  return (
    <div aria-live="polite">
      {deleteError ? (
        <p
          role="alert"
          className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {deleteError}
        </p>
      ) : null}

      {/* Loading */}
      {state.status === "loading" ? (
        <div role="status">
          <span className="sr-only">Loading your events…</span>

          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <li key={index}>
                <EventCardSkeleton />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Error */}
      {state.status === "error" ? (
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center"
        >
          <p className="font-semibold">We couldn’t load your events</p>

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

      {/* Empty state */}
      {state.status === "success" && events.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-brand-sage/50 bg-brand-forest/5 px-6 py-14 text-center dark:bg-brand-sage/10">
          <p className="max-w-md text-muted-foreground">
            You haven’t created any events yet. Start your first community
            drive to see it here.
          </p>

          <Button
            variant="default"
            size="sm"
            className="mt-1 bg-brand-forest text-brand-ivory hover:bg-brand-forest/90"
            onClick={() => router.push("/dashboard/create-event")}
          >
            <CalendarPlus data-icon="inline-start" />
            Create New Event
          </Button>
        </div>
      ) : null}

      {/* Events */}
      {state.status === "success" && events.length > 0 ? (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <li key={event._id}>
              <ManageEventCard
                event={event}
                deleting={deletingId === event._id}
                onDelete={() => handleDelete(event._id)}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
