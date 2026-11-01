import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Leaf,
  MapPin,
  UserRound,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  EventsApiError,
  fetchEventById,
} from "@/lib/api/events"
import { cn } from "@/lib/utils"

type EventDetailsPageProps = {
  params: Promise<{ id: string }>
}

function formatDate(isoDate: string): string | null {
  const date = new Date(isoDate)

  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

function formatTime(isoDate: string): string | null {
  const date = new Date(isoDate)

  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date)
}

export default async function EventDetailsPage({
  params,
}: EventDetailsPageProps) {
  const { id } = await params

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

  const dateLabel = formatDate(event.eventDate)
  const timeLabel = formatTime(event.eventDate)

  return (
    <main className="min-h-screen bg-background">
      {/* Top navigation */}
      <div className="mx-auto max-w-6xl px-4 pt-8">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-brand-forest dark:hover:text-brand-soft-sage"
        >
          <ArrowLeft className="size-4" />
          Back to Events
        </Link>
      </div>

      {/* Event content */}
      <section className="mx-auto max-w-6xl px-4 py-8 pb-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          {/* Main content */}
          <div className="min-w-0">
            {/* Event image */}
            <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-border/70 bg-brand-soft-sage/30">
              {event.imageUrl ? (
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  fill
                  priority
                  sizes="(min-width: 1024px) 65vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-brand-soft-sage text-brand-forest dark:bg-brand-sage/15 dark:text-brand-soft-sage">
                  <Leaf className="size-14" />
                </div>
              )}

              {event.eventType ? (
                <Badge className="absolute left-4 top-4 bg-brand-forest text-brand-ivory">
                  {event.eventType}
                </Badge>
              ) : null}
            </div>

            {/* Title and description */}
            <div className="mt-8">
              <h1 className="text-3xl font-bold tracking-tight text-brand-forest dark:text-brand-soft-sage sm:text-4xl">
                {event.title}
              </h1>

              <div className="mt-5 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:flex-wrap">
                {dateLabel ? (
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="size-4 text-brand-sage" />
                    {dateLabel}
                  </span>
                ) : null}

                {timeLabel ? (
                  <span className="inline-flex items-center gap-2">
                    <Clock className="size-4 text-brand-gold" />
                    {timeLabel}
                  </span>
                ) : null}

                {event.location ? (
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="size-4 text-brand-sage" />
                    {event.location}
                  </span>
                ) : null}
              </div>

              <div className="mt-8 border-t border-border/70 pt-8">
                <h2 className="text-xl font-semibold text-foreground">
                  About this event
                </h2>

                <p className="mt-4 whitespace-pre-line leading-7 text-muted-foreground">
                  {event.description?.trim() ||
                    "The organizer has not added a description for this event yet."}
                </p>
              </div>
            </div>
          </div>

          {/* Event information sidebar */}
          <aside className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold text-foreground">
              Event Information
            </h2>

            <div className="mt-5 space-y-5">
              {dateLabel ? (
                <div className="flex gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft-sage text-brand-forest dark:bg-brand-sage/15 dark:text-brand-soft-sage">
                    <CalendarDays className="size-5" />
                  </span>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Date
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {dateLabel}
                    </p>
                  </div>
                </div>
              ) : null}

              {timeLabel ? (
                <div className="flex gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft-sage text-brand-forest dark:bg-brand-sage/15 dark:text-brand-soft-sage">
                    <Clock className="size-5" />
                  </span>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Time
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {timeLabel}
                    </p>
                  </div>
                </div>
              ) : null}

              {event.location ? (
                <div className="flex gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft-sage text-brand-forest dark:bg-brand-sage/15 dark:text-brand-soft-sage">
                    <MapPin className="size-5" />
                  </span>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Location
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {event.location}
                    </p>
                  </div>
                </div>
              ) : null}

              {event.organizerName ? (
                <div className="flex gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft-sage text-brand-forest dark:bg-brand-sage/15 dark:text-brand-soft-sage">
                    <UserRound className="size-5" />
                  </span>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Organizer
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {event.organizerName}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-7 border-t border-border/70 pt-6">
              <p className="text-sm leading-6 text-muted-foreground">
                Be part of something meaningful. Join your community in making
                a positive impact.
              </p>

              <Link
                href={`/login?returnUrl=${encodeURIComponent(`/events/${event._id}`)}`}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "mt-5 w-full bg-brand-forest text-brand-ivory hover:bg-brand-forest/90"
                )}
              >
                Join Event
              </Link>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                Sign in to participate in this event.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}