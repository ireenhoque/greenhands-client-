import { Hero } from "@/components/site/hero"
import { RecentEvents } from "@/components/events/recent-events"
import { CommunityInAction } from "@/components/site/community-in-action"
import { SubscribeSection } from "@/components/site/subscribe-section"

/**
 * Homepage sections (top → bottom): hero CTA, upcoming events, the two
 * static sections added by the dashboard task, then the site footer
 * (rendered by the root layout directly after these).
 */
export default function Home() {
  return (
    <>
      <Hero />

      <RecentEvents />

      <CommunityInAction />

      <SubscribeSection />
    </>
  );
}
