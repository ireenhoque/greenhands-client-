import { Suspense } from "react"
import type { Metadata } from "next"

import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Register — GreenHands",
}

/**
 * Registration page. Mirrors /login and /signup, and carries ?returnUrl=…
 * the same way so a user who came from a login prompt returns to the same
 * page afterwards. Sign-up goes through Better Auth's email/password method
 * (which auto-signs-in the new user), reusing the existing auth stack.
 */
export default function RegisterPage() {
  return (
    <div className="flex justify-center px-4 py-16 md:py-24">
      {/* useSearchParams (returnUrl) needs a Suspense boundary during prerender */}
      <Suspense>
        <RegisterForm />
      </Suspense>
    </div>
  )
}
