import Link from "next/link"
import { ArrowLeft, CalendarX } from "lucide-react"

export default function EventNotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="max-w-md text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-brand-soft-sage text-brand-forest dark:bg-brand-sage/15 dark:text-brand-soft-sage">
          <CalendarX className="size-8" />
        </span>

        <h1 className="mt-6 text-2xl font-bold text-brand-forest dark:text-brand-soft-sage">
          Event not found
        </h1>

        <p className="mt-3 text-muted-foreground">
          This event may have been removed, or the link may be incorrect.
        </p>

        <Link
          href="/events"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-forest px-5 py-2.5 text-sm font-medium text-brand-ivory transition-colors hover:bg-brand-forest/90"
        >
          <ArrowLeft className="size-4" />
          Browse Upcoming Events
        </Link>
      </div>
    </main>
  )
}