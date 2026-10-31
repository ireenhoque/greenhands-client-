import Link from "next/link"
import { ArrowRight, HeartHandshake, Sprout } from "lucide-react"

import { ImpactStats } from "@/components/site/impact-stats"
import { buttonVariants } from "@/components/ui/button"
import { getSession } from "@/lib/session"
import { cn } from "cn"

const primaryActionClass = cn(
  buttonVariants({ variant: "default", size: "lg" }),
  "bg-brand-forest text-brand-ivory hover:bg-brand-forest/85 dark:border dark:border-white/10"
)

export function Hero() {
  const session = getSession()

  // Respects auth: logged-in users go straight to the form; logged-out users
  // are sent to Login with a return URL so they come back afterwards.
  const createEventHref = session?.user
    ? "/create-event"
    : `/login?returnUrl=${encodeURIComponent("/create-event")}`

  return (
    <section className="relative isolate overflow-hidden">
      {/* Subtle decorative background: soft brand washes + a faint dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute left-1/2 top-[-170px] h-[420px] w-[860px] max-w-[150%] -translate-x-1/2 rounded-full bg-brand-sage/25 blur-3xl dark:bg-brand-sage/15" />
        <div className="absolute -left-24 top-1/3 size-64 rounded-full bg-brand-gold/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 size-64 rounded-full bg-brand-forest/10 blur-3xl dark:bg-brand-forest/40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgb(49_92_67_/_0.1)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_80%)]" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-16 text-center md:py-24">
        {/* Eyebrow */}
        <span className="inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-full border border-brand-sage/40 bg-brand-forest/8 px-3.5 py-1.5 text-[0.65rem] font-semibold uppercase leading-relaxed tracking-[0.12em] text-brand-forest sm:text-xs dark:border-brand-sage/40 dark:bg-brand-sage/15 dark:text-brand-soft-sage">
          <Sprout aria-hidden className="size-3.5 shrink-0" />
          COMMUNITY-DRIVEN SOCIAL DEVELOPMENT PLATFORM
        </span>

        {/* Heading */}
        <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Small Acts.{" "}
          <span className="text-brand-forest dark:text-brand-soft-sage">
            Stronger Communities.
          </span>
        </h1>

        {/* Description */}
        <p className="mt-5 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
          Discover local volunteer opportunities, organize meaningful community
          events, and bring people together to make a lasting difference.
        </p>

        {/* Calls to action */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/events" className={primaryActionClass}>
            Explore Upcoming Events
            <ArrowRight data-icon="inline-end" />
          </Link>
          <Link
            href={createEventHref}
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            <HeartHandshake data-icon="inline-start" />
            Create an Event
          </Link>
        </div>

        {/* Impact statistics (placeholder values — see impact-stats.tsx) */}
        <ImpactStats className="mt-14 md:mt-16" />
      </div>
    </section>
  )
}
