import Image from "next/image"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"

/**
 * Site-wide footer rendered by the root layout below the page content.
 *
 * Link policy: items only become clickable once their route actually exists.
 * Set `href` to the route (e.g. "/events") when the page is built; until then
 * they render as clearly-marked, non-clickable "soon" text — never broken links.
 */
type FooterLink = {
  label: string
  href: string | null
}

type SocialLink = {
  label: string
  href: string
  icon: LucideIcon
}

const exploreLinks: FooterLink[] = [
  { label: "Home", href: "/" },
  { label: "Upcoming Events", href: "/events" },
  { label: "Create Event", href: "/dashboard/create-event" },
]

const communityLinks: FooterLink[] = [
  { label: "About Us", href: null }, // pending route: "/about"
  { label: "Contact", href: null }, // pending route: "/contact"
  { label: "Join the Movement", href: null }, // pending route: "/join"
]

// No official GreenHands profiles exist yet, so nothing is invented here and
// the social row stays hidden. Add real destinations to render it, e.g.:
// { label: "Instagram", href: "https://www.instagram.com/greenhands", icon: Instagram }
const socialLinks: SocialLink[] = []

function FooterLinkItem({ item }: { item: FooterLink }) {
  const baseClass =
    "-mx-2 inline-flex rounded-md px-2 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold"

  if (item.href) {
    return (
      <Link
        href={item.href}
        className={`${baseClass} text-brand-ivory/80 underline-offset-4 hover:text-brand-ivory hover:underline hover:decoration-brand-gold`}
      >
        {item.label}
      </Link>
    )
  }

  return (
    <span
      title={`${item.label} — page coming soon`}
      className={`${baseClass} items-center gap-2 text-brand-ivory/70`}
    >
      {item.label}
      <span className="rounded-full px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-brand-ivory/70 ring-1 ring-brand-ivory/20">
        Soon
      </span>
    </span>
  )
}

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <nav aria-label={`${title} links`}>
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-soft-sage">
        {title}
      </h2>
      <ul className="mt-4 flex flex-col">
        {links.map((item) => (
          <li key={item.label}>
            <FooterLinkItem item={item} />
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function Footer() {
  return (
    <footer className="mt-auto">
      {/* Subtle gold hairline separating the footer from the page above */}
      <div
        aria-hidden
        className="h-px w-full bg-linear-to-r from-transparent via-brand-gold/40 to-transparent"
      />

      <div className="bg-brand-forest">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 items-start gap-10 sm:grid-cols-2 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)] md:gap-12">
            {/* Brand */}
            <div className="sm:col-span-2 md:col-span-1">
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white ring-1 ring-brand-ivory/15">
                  <Image
                    src="/logo-mark.png"
                    alt=""
                    width={48}
                    height={48}
                    className="rounded-lg"
                  />
                </span>
                <span className="flex flex-col leading-none">
                  <span className="text-xl font-bold text-brand-ivory">
                    GreenHands
                  </span>
                  <span className="mt-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-brand-gold">
                    Community Action
                  </span>
                </span>
              </Link>

              <p className="mt-5 max-w-sm text-[0.9375rem] leading-relaxed text-brand-ivory/75">
                Small acts. Stronger communities. GreenHands brings people
                together to create meaningful change through local
                community-service initiatives.
              </p>

              {socialLinks.length > 0 && (
                <ul
                  aria-label="Social media"
                  className="mt-6 flex items-center gap-2.5"
                >
                  {socialLinks.map(({ label, href, icon: Icon }) => (
                    <li key={label}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="grid size-10 place-items-center rounded-full bg-brand-ivory/10 text-brand-ivory transition-colors hover:bg-brand-gold/25 hover:text-brand-gold"
                      >
                        <Icon className="size-4" aria-hidden />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <FooterColumn title="Explore" links={exploreLinks} />
            <FooterColumn title="Community" links={communityLinks} />
          </div>

          {/* Bottom bar */}
          <div className="mt-12 border-t border-brand-ivory/10 pt-6 md:mt-16">
            <p className="text-xs text-brand-ivory/70">
              © 2026 GreenHands. Building stronger communities together.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
