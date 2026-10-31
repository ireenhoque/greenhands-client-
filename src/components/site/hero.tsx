import { ArrowRight, Leaf, Sprout } from "lucide-react"

import { Button } from "@/components/ui/button"

const stats = [
  { value: "320+", label: "Active Volunteers", className: "text-green-600 dark:text-green-400" },
  { value: "48", label: "Cleanups Completed", className: "text-blue-600 dark:text-blue-400" },
  { value: "5,200+", label: "Seedlings Planted", className: "text-violet-600 dark:text-violet-400" },
  { value: "100%", label: "Community Led", className: "text-amber-600 dark:text-amber-400" },
]

export function Hero() {
  return (
    <section
      id="events"
      className="mx-auto flex max-w-6xl flex-col items-center px-4 py-16 text-center md:py-24"
    >
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        <Sprout className="size-3.5" />
        Neighbor-powered environmental action
      </span>

      <h1 className="mt-6 w-full max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
        Rooted in Community.{" "}
        <span className="text-primary">Growing Good Together.</span>
      </h1>

      <p className="mt-5 w-full max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
        Join neighbors for tree plantings, park cleanups, and donation drives
        across the city — or rally your own block and start one.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button size="lg">
          Explore Upcoming Events
          <ArrowRight data-icon="inline-end" />
        </Button>
        <Button size="lg" variant="outline">
          <Leaf data-icon="inline-start" />
          Start a Drive
        </Button>
      </div>

      <div
        id="impact"
        className="mt-16 grid w-full max-w-4xl grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center justify-center gap-1 rounded-xl border bg-card p-4 md:p-5"
          >
            <span className={`text-2xl font-bold md:text-3xl ${stat.className}`}>
              {stat.value}
            </span>
            <span className="text-xs text-muted-foreground md:text-sm">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
