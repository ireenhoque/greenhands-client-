"use client"

import { useState, type FormEvent } from "react"
import { Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

/**
 * "Subscribe to Local Cause Alerts" — static homepage section (reference:
 * STAY CONNECTED eyebrow, heading, subtitle, email input + Subscribe
 * button, footnote).
 *
 * Static by design per the task: there is NO subscription backend, so the
 * button deliberately does not pretend to subscribe anyone — clicking shows
 * an honest demo notice instead of a fake success state.
 */
export function SubscribeSection() {
  const [email, setEmail] = useState("")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // No persistence: this is a static demo section, so subscription is
    // never faked — the notice below states it plainly.
    setEmail("")
  }

  return (
    <section
      aria-labelledby="subscribe-heading"
      className="mx-auto w-full max-w-6xl px-4 pb-20"
    >
      <div className="rounded-3xl border border-border/70 bg-brand-soft-sage/30 px-6 py-12 text-center sm:px-12 md:py-16 dark:bg-brand-forest/10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-sage">
          Stay Connected
        </p>

        <h2
          id="subscribe-heading"
          className="mx-auto mt-3 max-w-xl text-balance text-3xl font-bold tracking-tight sm:text-4xl"
        >
          Subscribe to Local Cause Alerts
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground md:text-lg">
          Get notified when new winter drives, blanket distributions, or
          emergency cleanups are organized in your neighborhood.
        </p>

        {/* Visual-only subscription form (static section) */}
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
        >
          <label className="sr-only" htmlFor="subscribe-email">
            Email address
          </label>

          <Input
            id="subscribe-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email address"
            className="h-12 flex-1 rounded-xl bg-background"
          />

          <Button
            type="submit"
            size="lg"
            className="h-12 rounded-xl bg-brand-forest text-brand-ivory hover:bg-brand-forest/90"
          >
            <Send data-icon="inline-start" />
            Subscribe
          </Button>
        </form>

        <p className="mt-4 text-xs text-muted-foreground" aria-live="polite">
          No spam guaranteed. Unsubscribe at any time.
        </p>
      </div>
    </section>
  )
}
