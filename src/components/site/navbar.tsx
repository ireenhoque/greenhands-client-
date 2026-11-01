import Image from "next/image"
import Link from "next/link"

import { AuthControls } from "@/components/site/auth-controls"
import { MobileNav } from "@/components/site/mobile-nav"
import { NAV_LINKS } from "@/components/site/nav-links"
import { ThemeToggle } from "@/components/site/theme-toggle"
import { Suspense } from "react"
import { getSession } from "@/lib/session"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4"
      >
        {/* Brand */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          {/*
            logo.png framed to its emblem: the file is a full lockup with an
            opaque white background, so the tile keeps it seamless in both
            themes. The crop values (220% scale, -43% offset) were derived from
            the image's measured emblem bounds — the baked-in wordmark sits just
            below the tile edge and is excluded.
          */}
          <span className="relative size-10 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
            <Image
              src="/logo.png"
              alt=""
              width={88}
              height={88}
              priority
              className="absolute left-1/2 top-[-43%] w-[220%] max-w-none -translate-x-1/2"
            />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-lg font-bold text-brand-forest dark:text-brand-soft-sage">
              GreenHands
            </span>
            <span className="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Community Action
            </span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <Link
                href={href}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right section: theme toggle + auth + mobile menu */}
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          {/* The session is a request-time read (cacheComponents), so the
              auth-aware controls stream in behind this boundary while the
              rest of the navbar prerenders into the static shell. */}
          <Suspense fallback={<UserNavFallback />}>
            <UserNav />
          </Suspense>
        </div>
      </nav>
    </header>
  )
}

/** Matches the streamed controls' footprint so the navbar doesn't shift. */
function UserNavFallback() {
  return (
    <div aria-hidden className="flex items-center gap-1.5">
      <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
      <div className="h-9 w-9 animate-pulse rounded-md bg-muted md:hidden" />
    </div>
  )
}

async function UserNav() {
  const session = await getSession()
  const user = session?.user ?? null

  return (
    <>
      <AuthControls user={user} />
      <MobileNav user={user} />
    </>
  )
}
