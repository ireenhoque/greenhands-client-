import { CalendarDays, Home } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type NavLink = {
  label: string
  href: string
  icon: LucideIcon
}

/**
 * Primary site navigation — shared by the desktop navbar and the mobile
 * sheet menu so both stay in sync.
 */
export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Upcoming Events", href: "/events", icon: CalendarDays },
]
