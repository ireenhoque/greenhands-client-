import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/site/navbar";
import { Hero } from "@/components/site/hero";
import { Footer } from "@/components/site/footer";

const josefinSans = Josefin_Sans({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GreenHands — Growing Good Together",
  description:
    "Join neighbors for tree plantings, park cleanups, and donation drives across the city, or start your own.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${josefinSans.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main>
          {children}
          <Hero />
        </main>

        <Footer />
      </body>
    </html>
  );
}
