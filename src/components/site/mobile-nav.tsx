"use client"

import Link from "next/link"
import { Menu } from "lucide-react"

import { AccountList } from "@/components/site/auth-controls"
import { NAV_LINKS } from "@/components/site/nav-links"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { SessionUser } from "@/lib/session"

/** Hamburger menu backed by the shadcn Sheet — keeps every nav link reachable on mobile. */
export function MobileNav({ user }: { user: SessionUser | null }) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open navigation menu"
            className="md:hidden"
          />
        }
      >
        <Menu />
      </SheetTrigger>

      <SheetContent side="right" className="gap-0 p-0">
        <SheetHeader className="border-b pr-12">
          <SheetTitle className="text-base font-bold text-brand-forest dark:text-brand-soft-sage">
            GreenHands
          </SheetTitle>
          <SheetDescription className="sr-only">
            Navigation menu and account options
          </SheetDescription>
        </SheetHeader>

        <nav aria-label="Mobile navigation" className="flex flex-col gap-1 px-4">
          {NAV_LINKS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-2 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <span
                aria-hidden
                className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-forest/10 text-brand-forest dark:bg-brand-sage/15 dark:text-brand-soft-sage"
              >
                <Icon className="size-4" />
              </span>
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t p-4">
          <AccountList user={user} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
