
"use client"

import { useMemo, useState } from "react"
import { Search, SlidersHorizontal } from "lucide-react"

import { EventCard } from "@/components/events/event-card"
import type { RecentEvent } from "@/lib/api/events"

type EventsFilterProps = {
  events: RecentEvent[]
}

export function EventsFilter({ events }: EventsFilterProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  // Generate categories from the available events.
  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        events
          .map((event) => event.eventType?.trim())
          .filter((category): category is string => Boolean(category))
      ),
    ].sort((a, b) => a.localeCompare(b))

    return ["All", ...uniqueCategories]
  }, [events])

  // Apply search and category filtering together.
  const filteredEvents = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()

    return events.filter((event) => {
      const matchesSearch = event.title
        .toLowerCase()
        .includes(normalizedSearch)

      const matchesCategory =
        selectedCategory === "All" ||
        event.eventType?.trim() === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [events, searchQuery, selectedCategory])

  return (
    <div>
      {/* Search and category filters */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search events by title..."
            aria-label="Search events by title"
            className="h-12 w-full rounded-xl border border-border bg-background pl-12 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand-sage focus:ring-2 focus:ring-brand-sage/20"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-muted-foreground" />

            <h3 className="text-sm font-semibold text-foreground">
              Filter by category
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const isSelected = selectedCategory === category

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  aria-pressed={isSelected}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    isSelected
                      ? "border-brand-forest bg-brand-forest text-brand-ivory dark:border-brand-sage dark:bg-brand-sage dark:text-brand-forest"
                      : "border-border bg-background text-muted-foreground hover:border-brand-sage hover:text-foreground"
                  }`}
                >
                  {category}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {filteredEvents.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">
              {events.length}
            </span>{" "}
            events
          </p>

          {(searchQuery || selectedCategory !== "All") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("All")
              }}
              className="text-sm font-medium text-brand-forest underline-offset-4 hover:underline dark:text-brand-soft-sage"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Filtered event cards */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event, index) => (
            <EventCard
              key={event._id}
              event={event}
              priority={index === 0}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-brand-sage/40 bg-brand-soft-sage/20 px-6 py-14 text-center dark:bg-brand-forest/10">
          <h3 className="text-lg font-semibold text-foreground">
            No matching events found
          </h3>

          <p className="mt-2 text-sm text-muted-foreground">
            Try another search term or select a different category.
          </p>

          <button
            type="button"
            onClick={() => {
              setSearchQuery("")
              setSelectedCategory("All")
            }}
            className="mt-5 rounded-lg bg-brand-forest px-5 py-2.5 text-sm font-medium text-brand-ivory transition-colors hover:bg-brand-forest/90"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
