import Image from "next/image"
import { MapPin } from "lucide-react"

/**
 * "Community in Action" — static homepage gallery (reference layout:
 * VISUAL STORIES eyebrow, heading, subtitle, 3-column photo cards with a
 * pill badge, title, and location over the image).
 *
 * Static by design: no gallery API, no event data dependency. The six
 * photos are project-chosen Unsplash images already whitelisted in
 * next.config.ts — the same hosts real event thumbnails use.
 */

const GALLERY_ITEMS = [
  {
    pill: "Warmth for Rickshaw Pullers",
    title: "Winter Clothes Drive",
    location: "Mirpur 10, Dhaka",
    imageUrl:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=60",
  },
  {
    pill: "Shelterless Night Support",
    title: "Night Blanket Relief",
    location: "Uttara, Dhaka",
    imageUrl:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=60",
  },
  {
    pill: "Eco Plastic-Free Waters",
    title: "Dhanmondi Lake Clean-up",
    location: "Gulshan, Dhaka",
    imageUrl:
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=900&q=60",
  },
  {
    pill: "Food for Everyone",
    title: "Community Food Relief",
    location: "Farmgate, Dhaka",
    imageUrl:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=60",
  },
  {
    pill: "Learning for Every Child",
    title: "Children Book & Bag Drive",
    location: "Laksam, Cumilla",
    imageUrl:
      "https://images.unsplash.com/photo-1453738773917-9c3eff1db985?auto=format&fit=crop&w=900&q=60",
  },
  {
    pill: "Greener Together",
    title: "Neighborhood Tree Plantation",
    location: "Cumilla University Campus, Cumilla",
    imageUrl:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=60",
  },
]

export function CommunityInAction() {
  return (
    <section
      aria-labelledby="community-in-action-heading"
      className="mx-auto w-full max-w-6xl px-4 py-16 md:py-20"
    >
      {/* Section header */}
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-sage">
          Visual Stories
        </p>

        <h2
          id="community-in-action-heading"
          className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl"
        >
          Community in Action
        </h2>

        <p className="mt-3 text-pretty text-muted-foreground md:text-lg">
          Moments from volunteer drives, relief distributions, and green
          initiatives across Dhaka and beyond.
        </p>
      </div>

      {/* Photo cards */}
      <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {GALLERY_ITEMS.map((item) => (
          <li key={item.title}>
            {/* Static, non-interactive gallery card */}
            <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border/70 bg-brand-forest/10 shadow-sm">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />

              {/* Bottom gradient for text legibility (reference style) */}
              <div
                aria-hidden
                className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-transparent"
              />

              <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-1.5 p-4">
                <span className="inline-flex max-w-max items-center rounded-md bg-brand-sage/90 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-brand-forest">
                  {item.pill}
                </span>

                <p className="truncate text-base font-semibold text-white">
                  {item.title}
                </p>

                <p className="flex items-center gap-1.5 text-xs text-white/85">
                  <MapPin aria-hidden className="size-3.5" />
                  {item.location}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
