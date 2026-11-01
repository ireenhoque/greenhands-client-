"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"

/**
 * Accepts only same-site, absolute-path return paths. Anything else (missing,
 * empty, external URLs like "//evil.com" or "https://...") falls back to "/" —
 * the login page can never be used as an open redirect.
 */
function sanitizeReturnUrl(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/"
}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = sanitizeReturnUrl(searchParams.get("returnUrl"))

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  function showAuthError(message?: string | null) {
    setError(message || "Could not sign you in. Please try again.")
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    setError(null)
    setPending(true)

    try {
      const { error: authError } = await authClient.signIn.email({
        email,
        password,
        callbackURL: returnUrl,
      })

      if (authError) {
        showAuthError(authError.message)
        return
      }

      // Back to wherever the user came from (navbar Login link, hero CTA…).
      router.push(returnUrl)
      router.refresh()
    } catch {
      showAuthError()
    } finally {
      setPending(false)
    }
  }

  async function handleGoogleSignIn() {
    if (pending) return

    setError(null)
    setPending(true)

    try {
      const { error: authError } = await authClient.signIn.social({
        provider: "google",
        // Preserved through the OAuth round-trip — lands the user on the
        // page they started from after Google redirects them back.
        callbackURL: returnUrl,
      })

      // On success the client navigates to Google itself; only show errors.
      if (authError) {
        showAuthError(
          authError.message || "Google sign-in is not available right now."
        )
        setPending(false)
      }
    } catch {
      showAuthError("Google sign-in is not available right now.")
      setPending(false)
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
        <CardAction>
          <Link href={`/signup?returnUrl=${encodeURIComponent(returnUrl)}`}>
            <Button variant="link" type="button">
              Sign Up
            </Button>
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form id="login-form" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" form="login-form" className="w-full" disabled={pending}>
          {pending ? "Logging in…" : "Login"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={pending}
          onClick={handleGoogleSignIn}
        >
          Login with Google
        </Button>
      </CardFooter>
    </Card>
  )
}
