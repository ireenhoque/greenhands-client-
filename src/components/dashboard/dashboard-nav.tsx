"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import { CalendarPlus, LayoutDashboard, ListChecks, UserRound } from "lucide-react"

import { cn } from "@/lib/utils"

type DashboardLink = {
  label: string
  href: string
  icon: LucideIcon
}

/**
 * Dashboard section navigation — shared by the desktop bar and (via wrapping)
 * the same responsive markup on every screen size, matching the navbar's
 * horizontal layout rather than a sidebar.
 *
 * Active highlight follows the URL so it works inside layouts and across
 * sub-routes (e.g. an edit page under /dashboard/edit-event/... highlights
 * Manage Events, from where it is reached).
 */
const DASHBOARD_LINKS: DashboardLink[] = [
  {
    label: "Create Event",
    href: "/dashboard/create-event",
    icon: CalendarPlus,
  },
  {
    label: "Manage Events",
    href: "/dashboard/manage-events",
    icon: LayoutDashboard,
  },
  {
    label: "Joined Events",
    href: "/dashboard/joined-events",
    icon: ListChecks,
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: UserRound,
  },
]

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function DashboardNav({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Dashboard navigation"
      className={cn("-mx-1 overflow-x-auto", className)}
    >
      <ul className="flex min-w-max items-center gap-1.5">
        {DASHBOARD_LINKS.map(({ label, href, icon: Icon }) => {
          const active = isActive(pathname, href)

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "border-brand-forest bg-brand-forest text-brand-ivory dark:border-brand-sage dark:bg-brand-sage dark:text-brand-forest"
                    : "border-border bg-background text-muted-foreground hover:border-brand-sage hover:text-foreground"
                )}
              >
                <Icon aria-hidden className="size-4" />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
