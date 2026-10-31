import Image from "next/image"
import Link from "next/link"

import { ThemeToggle } from "@/components/site/theme-toggle"
import { Button } from "@/components/ui/button"

const links = [
  { href: "#events", label: "Upcoming Events" },
  { href: "#impact", label: "Our Impact" },
]

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4"
      >
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo-mark.png"
            alt="GreenHands logo"
            width={38}
            height={38}
            priority
          />
          <span className="flex flex-col leading-none">
            <span className="text-lg font-bold text-primary">GreenHands</span>
            <span className="text-[0.6rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Grow good together
            </span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Button size="sm">
            Log In
          </Button>
        </div>
      </nav>
    </header>
  )
}
