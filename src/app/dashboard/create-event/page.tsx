import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"

import { EventForm } from "@/components/events/event-form"

/**
 * Create Event — dashboard route /dashboard/create-event.
 *
 * Header matches the reference ("Social Service Drive" badge, "Create a
 * Community Event" heading, Back to Upcoming Events link). The organizer is
 * attached server-side by the Express API from the Better Auth session —
 * never from client input.
 */
export default function CreateEventPage() {
  return (
    <div>
      {/* Back link (reference places it above the form card) */}
      <Link
        href="/events"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-brand-forest dark:hover:text-brand-soft-sage"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Back to Upcoming Events
      </Link>

      <div className="mt-6 rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-10">
        {/* Page header */}
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-sage">
            <Sparkles aria-hidden className="size-3.5" />
            Social Service Drive
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Create a Community Event
          </h1>

          <p className="mt-3 text-muted-foreground">
            Organize a local relief effort, environmental cleanup, or community
            support drive.
          </p>
        </div>

        {/* Form */}
        <div className="mt-10">
          <EventForm mode="create" />
        </div>
      </div>
    </div>
  )
}
