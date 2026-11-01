import { Suspense } from "react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft, Pencil } from "lucide-react"

import { EventForm } from "@/components/events/event-form"
import {
  EventsApiError,
  fetchEventById,
} from "@/lib/api/events"
import { getSession } from "@/lib/session"

type EditEventPageProps = {
  params: Promise<{ id: string }>
}

/** Skeleton footprint matching the loaded page (back link + card shell). */
function EditEventFallback() {
  return (
    <div>
      <div className="h-5 w-40 animate-pulse rounded bg-muted" />

      <div className="mt-6 rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-10">
        <div className="max-w-2xl space-y-3">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-9 w-72 max-w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-96 max-w-full animate-pulse rounded bg-muted" />
        </div>

        <div className="mt-10 space-y-6">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

async function EditEventContent({ id }: { id: string }) {
  const session = await getSession()
  if (!session) {
    redirect(`/login?returnUrl=${encodeURIComponent(`/dashboard/edit-event/${id}`)}`)
  }

  let event

  try {
    event = await fetchEventById(id)
  } catch (error) {
    if (
      error instanceof EventsApiError &&
      (error.message.includes("404") ||
        error.message.toLowerCase().includes("event not found"))
    ) {
      notFound()
    }

    throw error
  }

  const ownedByViewer = Boolean(
    event.organizerEmail &&
      session &&
      event.organizerEmail.toLowerCase() === session.user.email?.toLowerCase()
  )

  if (!ownedByViewer) {
    return (
      <div>
        <Link
          href="/dashboard/manage-events"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-brand-forest dark:hover:text-brand-soft-sage"
        >
          <ArrowLeft aria-hidden className="size-4" />
          Back to Manage Events
        </Link>

        <div
          role="alert"
          className="mt-6 rounded-3xl border border-destructive/30 bg-destructive/5 p-8"
        >
          <h1 className="text-xl font-semibold text-foreground">
            You can’t edit this event
          </h1>

          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Only the event’s organizer can edit or delete it. The backend
            rejects the request even if this page is opened directly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Back link */}
      <Link
        href="/dashboard/manage-events"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-brand-forest dark:hover:text-brand-soft-sage"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Back to Manage Events
      </Link>

      <div className="mt-6 rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-10">
        {/* Page header */}
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-sage">
            <Pencil aria-hidden className="size-3.5" />
            Edit Initiative
          </p>

          <h1 className="mt-3 truncate text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {event.title}
          </h1>

          <p className="mt-3 text-muted-foreground">
            Update the details below and save your changes. Volunteers see the
            new information immediately.
          </p>
        </div>

        {/* Form (edit mode preloaded from the API) */}
        <div className="mt-10">
          <EventForm mode="edit" event={event} />
        </div>
      </div>
    </div>
  )
}

/**
 * Edit Event — dashboard route /dashboard/edit-event/[id].
 *
 * Loads the event's current data into the same form used for creation and
 * saves via PUT /events/:id. The backend authorizes the update against the
 * verified session's organizerEmail, so reaching this URL for someone
 * else's event can never succeed — this page additionally short-circuits
 * obvious mismatches for a friendlier error.
 *
 * The session + event reads are request-time (cacheComponents), so they
 * stream inside a Suspense boundary.
 */
export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params

  return (
    <Suspense fallback={<EditEventFallback />}>
      <EditEventContent id={id} />
    </Suspense>
  )
}
