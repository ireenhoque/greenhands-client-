import type { LucideIcon } from "lucide-react"
import { CalendarCheck, HeartHandshake, Sprout, Users } from "lucide-react"

import { cn } from "cn"

export type ImpactStat = {
  label: string
  /**
   * null renders an em-dash placeholder (with an accessible "coming soon"
   * label). Replace with the real number from your stats API, e.g. "1,450+".
   */
  value: string | null
  icon: LucideIcon
}

/**
 * ⚠️ PLACEHOLDER VALUES — these are NOT real platform statistics.
 *
 * No statistics API exists in this project yet, so the values are intentionally
 * `null` (rendered as "—") instead of invented numbers. When a backend endpoint
 * exists, either update the values here or pass your own list:
 *
 *   <ImpactStats stats={[{ label: "Active Volunteers", value: "1,450+", icon: Users }, ...]} />
 */
export const placeholderImpactStats: ImpactStat[] = [
  { label: "Active Volunteers", value: null, icon: Users },
  { label: "Events Completed", value: null, icon: CalendarCheck },
  { label: "Lives Impacted", value: null, icon: HeartHandshake },
  { label: "Community Driven", value: null, icon: Sprout },
]

export function ImpactStats({
  stats = placeholderImpactStats,
  className,
}: {
  stats?: ImpactStat[]
  className?: string
}) {
  return (
    <ul
      aria-label="Platform impact statistics"
      className={cn(
        "grid w-full max-w-3xl grid-cols-2 gap-3 md:grid-cols-4 md:gap-4",
        className
      )}
    >
      {stats.map(({ label, value, icon: Icon }) => (
        <li
          key={label}
          className="flex flex-col items-center rounded-xl border border-border/70 bg-card/70 px-3 py-4 text-center shadow-sm backdrop-blur-sm dark:bg-card/60"
        >
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-lg bg-brand-forest/10 text-brand-forest dark:bg-brand-sage/15 dark:text-brand-soft-sage"
          >
            <Icon className="size-4" />
          </span>
          <p className="mt-2 text-2xl font-bold tracking-tight text-brand-forest dark:text-brand-soft-sage">
            {value ?? <span aria-hidden>—</span>}
            {value === null && (
              <span className="sr-only">Statistics coming soon</span>
            )}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{label}</p>
        </li>
      ))}
    </ul>
  )
}
