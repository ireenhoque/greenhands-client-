import { ArrowLeft } from "lucide-react"

export default function EventDetailsLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 pt-8">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
      </div>

      <section className="mx-auto max-w-6xl px-4 py-8 pb-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Main event content skeleton */}
          <div>
            <div className="aspect-[16/9] animate-pulse rounded-3xl bg-muted" />

            <div className="mt-8 space-y-4">
              <div className="h-9 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />
              <div className="h-5 w-full animate-pulse rounded bg-muted" />
              <div className="h-5 w-5/6 animate-pulse rounded bg-muted" />
            </div>
          </div>

          {/* Event information skeleton */}
          <aside className="h-80 animate-pulse rounded-2xl border border-border/70 bg-muted/40" />
        </div>
      </section>
    </main>
  )
}