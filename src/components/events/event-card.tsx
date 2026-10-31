import Image from "next/image"
import Link from "next/link"
import { ArrowRight, CalendarDays, Leaf, MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import type { RecentEvent } from "@/lib/api/events"
import { cn } from "cn"

function formatDate(isoDate: string): string | null {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

/**
 * One upcoming-event card: thumbnail, title, type, location, date and a
 * View Details button linking to /events/[id].
 *
 * `h-full` + a `mt-auto` footer keep every card equal in height inside the
 * responsive grid (1 / 2 / 3 columns).
 */
export function EventCard({ event }: { event: RecentEvent }) {
  const dateLabel = event.eventDate ? formatDate(event.eventDate) : null

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all hover:border-brand-sage/60 hover:shadow-md">
      {/* Thumbnail — fixed aspect ratio keeps every image the same size */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-brand-forest/10">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            aria-hidden
            className="flex h-full items-center justify-center bg-brand-soft-sage text-brand-forest dark:bg-brand-sage/15 dark:text-brand-soft-sage"
          >
            <Leaf className="size-8" />
          </div>
        )}

        {event.eventType ? (
          <Badge className="absolute top-3 left-3 bg-brand-forest text-brand-ivory">
            {event.eventType}
          </Badge>
        ) : null}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="line-clamp-2 text-lg leading-snug font-semibold tracking-tight text-foreground transition-colors group-hover:text-brand-forest dark:group-hover:text-brand-soft-sage">
          {event.title}
        </h3>

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
          {dateLabel ? (
            <li className="flex items-center gap-2">
              <CalendarDays
                aria-hidden
                className="size-4 shrink-0 text-brand-gold"
              />
              <span>{dateLabel}</span>
            </li>
          ) : null}
        </ul>

        {/* Pinned to the bottom so all cards stay equal height */}
        <div className="mt-auto pt-2">
          <Link
            href={`/events/${event._id}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "w-full border-brand-sage/50 text-brand-forest hover:border-brand-forest hover:bg-brand-forest hover:text-brand-ivory dark:border-brand-sage/50 dark:text-brand-soft-sage dark:hover:bg-brand-sage/20 dark:hover:text-foreground"
            )}
          >
            View Details
            <ArrowRight data-icon="inline-end" />
          </Link>
        </div>
      </div>
    </article>
  )
}
