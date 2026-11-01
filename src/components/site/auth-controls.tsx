"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  ListChecks,
  LogIn,
  LogOut,
  PlusCircle,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "cn"
import { authClient } from "@/lib/auth-client"
import type { SessionUser } from "@/lib/session"

export type AccountItem = {
  label: string
  /** Set to a route once the page exists; null renders it disabled with a "Soon" tag. */
  href: string | null
  icon: LucideIcon
}

/**
 * Account dropdown items. `href: null` means the route does not exist yet, so
 * the item is rendered as clearly-marked, non-clickable text — never a broken
 * link. Enable an item by filling in its route.
 */
export const ACCOUNT_ITEMS: AccountItem[] = [
  { label: "Create Event", href: "/create-event", icon: PlusCircle },
  { label: "Manage Events", href: null, icon: LayoutDashboard }, // pending: "/manage-events"
  { label: "Joined Events", href: null, icon: ListChecks }, // pending: "/joined-events"
  // Add { label: "My Profile", href: "/profile", icon: UserCircle } once
  // src/app/profile/page.tsx exists (the profile item is conditional on it).
]

/** Login URL that returns the user to the page they came from. */
function loginHref(pathname: string) {
  return pathname === "/login"
    ? "/login"
    : `/login?returnUrl=${encodeURIComponent(pathname)}`
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
  return initials || "?"
}

function useSignOut() {
  const router = useRouter()
  return async () => {
    await authClient.signOut()
    router.push("/")
    router.refresh()
  }
}

const forestActionClass =
  "bg-brand-forest text-brand-ivory hover:bg-brand-forest/85 dark:border dark:border-white/10"

function SoonTag() {
  return (
    <span className="ml-auto rounded-full px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-muted-foreground ring-1 ring-border">
      Soon
    </span>
  )
}

/**
 * Navbar auth controls (desktop bar):
 * - logged out → Login button (returns the user to the current page)
 * - logged in  → avatar that reveals the display name on hover and opens the
 *   account dropdown (Create Event / Manage Events / Joined Events / Logout)
 */
export function AuthControls({ user }: { user: SessionUser | null }) {
  const pathname = usePathname()

  if (!user) {
    return (
      <Link
        href={loginHref(pathname)}
        className={cn(
          buttonVariants({ variant: "default", size: "sm" }),
          forestActionClass
        )}
      >
        <LogIn data-icon="inline-start" />
        Login
      </Link>
    )
  }

  return <AccountDropdown user={user} />
}

function AccountDropdown({ user }: { user: SessionUser }) {
  const handleSignOut = useSignOut()

  return (
    <TooltipProvider delay={300}>
      <Tooltip>
        <TooltipTrigger render={<div className="inline-flex" />}>
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={`Account menu for ${user.name}`}
              title={user.name}
              className="group flex size-10 items-center justify-center rounded-full outline-none transition-shadow hover:ring-2 hover:ring-brand-sage/70 focus-visible:ring-2 focus-visible:ring-brand-gold data-[popup-open]:ring-2 data-[popup-open]:ring-brand-sage"
            >
              <Avatar>
                <AvatarImage src={user.image ?? undefined} alt="" />
                <AvatarFallback className="bg-brand-soft-sage font-semibold text-brand-forest">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" sideOffset={8} className="w-60">
              {/* The label renders Menu.GroupLabel, which requires the
                  MenuGroup context — it must sit inside a DropdownMenuGroup,
                  so it is grouped with the account items here (Base UI). */}
              <DropdownMenuGroup>
                <DropdownMenuLabel className="px-2 py-1.5">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {user.name}
                  </p>
                  {user.email ? (
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  ) : null}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {ACCOUNT_ITEMS.map((item) =>
                  item.href ? (
                    <DropdownMenuItem
                      key={item.label}
                      render={<Link href={item.href} />}
                      className="gap-2.5"
                    >
                      <item.icon className="text-brand-sage" />
                      {item.label}
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      key={item.label}
                      disabled
                      title={`${item.label} — page coming soon`}
                      className="gap-2.5"
                    >
                      <item.icon />
                      {item.label}
                      <SoonTag />
                    </DropdownMenuItem>
                  )
                )}
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="gap-2.5">
                <LogOut />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end">
          {user.name}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Account section shown inside the mobile navigation sheet — the same items as
 * the desktop dropdown, laid out as a full-height list.
 */
export function AccountList({ user }: { user: SessionUser | null }) {
  const pathname = usePathname()

  if (!user) {
    return (
      <Link
        href={loginHref(pathname)}
        className={cn(
          buttonVariants({ variant: "default", size: "lg" }),
          forestActionClass,
          "w-full"
        )}
      >
        <LogIn data-icon="inline-start" />
        Login
      </Link>
    )
  }

  return <AccountListFor user={user} />
}

function AccountListFor({ user }: { user: SessionUser }) {
  const handleSignOut = useSignOut()

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 px-1">
        <Avatar>
          <AvatarImage src={user.image ?? undefined} alt="" />
          <AvatarFallback className="bg-brand-soft-sage font-semibold text-brand-forest">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {user.name}
          </p>
          {user.email ? (
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          ) : null}
        </div>
      </div>

      <ul className="flex flex-col gap-1">
        {ACCOUNT_ITEMS.map((item) => (
          <li key={item.label}>
            {item.href ? (
              <Link
                href={item.href}
                className="flex items-center gap-2.5 rounded-md px-2 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <item.icon className="text-brand-sage" />
                {item.label}
              </Link>
            ) : (
              <span
                title={`${item.label} — page coming soon`}
                className="flex items-center gap-2.5 rounded-md px-2 py-2.5 text-sm font-medium text-muted-foreground"
              >
                <item.icon />
                {item.label}
                <SoonTag />
              </span>
            )}
          </li>
        ))}
      </ul>

      <Button
        variant="outline"
        size="lg"
        onClick={handleSignOut}
        className="w-full justify-start gap-2.5"
      >
        <LogOut />
        Log Out
      </Button>
    </div>
  )
}
