import Link from "next/link"
import { CalendarPlus, Settings2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button"
import { ManageEventsList } from "@/components/events/manage-events-list"
import { cn } from "cn"

/**
 * Manage Events — dashboard route /dashboard/manage-events.
 *
 * The list itself is client-side (fetch /events/mine with the session
 * cookie); the backend only returns events created by the signed-in user,
 * and edit/delete authorization is enforced server-side per event.
 */
export default function ManageEventsPage() {
  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-sage">
            <Settings2 aria-hidden className="size-3.5" />
            Organizer Dashboard
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Manage My Events
          </h1>

          <p className="mt-3 text-muted-foreground">
            View, edit, and manage the social drives you have published. Only
            you have permission to edit or delete your created initiatives.
          </p>
        </div>

        <Link
          href="/dashboard/create-event"
          className={cn(
            buttonVariants({ size: "lg" }),
            "bg-brand-forest text-brand-ivory hover:bg-brand-forest/90"
          )}
        >
          <CalendarPlus data-icon="inline-start" />
          Create New Event
        </Link>
      </div>

      {/* Own events */}
      <div className="mt-10">
        <ManageEventsList />
      </div>
    </div>
  )
}
