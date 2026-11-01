import { Suspense } from "react"
import type { Metadata } from "next"

import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Log in — GreenHands",
}

/**
 * Login page. Login links across the site arrive as
 * /login?returnUrl=<current path>; the form returns users to where they came
 * from, with external URLs sanitized away as an open-redirect defense.
 */
export default function LoginPage() {
  return (
    <div className="flex justify-center px-4 py-16 md:py-24">
      {/* useSearchParams (returnUrl) needs a Suspense boundary during prerender */}
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  )
}
