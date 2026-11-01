import { CheckCircle2 } from "lucide-react"

import { JoinedEventsList } from "@/components/events/joined-events-list"

/**
 * Joined Events — dashboard route /dashboard/joined-events.
 *
 * Lists event initiatives the signed-in user joined, fetched from
 * GET /events/joined (server-resolved from the verified session). Each card
 * links through to the event's detail page.
 */
export default function JoinedEventsPage() {
  return (
    <div>
      {/* Header */}
      <div className="max-w-2xl">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-sage">
          <CheckCircle2 aria-hidden className="size-3.5" />
          Organizer Dashboard
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Events I’ve Joined
        </h1>

        <p className="mt-3 text-muted-foreground">
          The community drives you signed up for as a volunteer. Staying
          committed to even one event helps make change happen.
        </p>
      </div>

      {/* Joined events (persistent join records) */}
      <div className="mt-10">
        <JoinedEventsList />
      </div>
    </div>
  )
}
