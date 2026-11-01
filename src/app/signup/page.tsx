import { Suspense } from "react"
import type { Metadata } from "next"

import { SignupForm } from "@/components/auth/signup-form"

export const metadata: Metadata = {
  title: "Sign up — GreenHands",
}

/**
 * Sign-up page, mirroring /login. Supports /signup?returnUrl=... the same way
 * so a user who came from a login prompt returns to the same page afterwards.
 */
export default function SignupPage() {
  return (
    <div className="flex justify-center px-4 py-16 md:py-24">
      {/* useSearchParams (returnUrl) needs a Suspense boundary during prerender */}
      <Suspense>
        <SignupForm />
      </Suspense>
    </div>
  )
}
