import { Skeleton } from "@/components/ui/skeleton"

/**
 * Loading placeholder that mirrors the EventCard geometry (same aspect-ratio
 * image block, title/meta lines, and footer button) so the grid does not
 * jump when real data arrives.
 */
export function EventCardSkeleton() {
  return (
    <div
      aria-hidden
      className="h-full overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm"
    >
      <Skeleton className="aspect-[16/9] w-full rounded-none" />
      <div className="flex flex-col gap-3 p-5">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-4 w-1/2" />
        <div className="mt-auto pt-2">
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    </div>
  )
}
