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

/** Same open-redirect defense as the login form. */
function sanitizeReturnUrl(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/"
}

export function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = sanitizeReturnUrl(searchParams.get("returnUrl"))

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  function showAuthError(message?: string | null) {
    setError(message || "Could not create your account. Please try again.")
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    setError(null)
    setPending(true)

    try {
      const { error: authError } = await authClient.signUp.email({
        name,
        email,
        password,
        // Creating the account also signs the user in (Better Auth's
        // autoSignIn default), so the same return-URL flow as login applies.
        callbackURL: returnUrl,
      })

      if (authError) {
        showAuthError(authError.message)
        return
      }

      router.push(returnUrl)
      router.refresh()
    } catch {
      showAuthError()
    } finally {
      setPending(false)
    }
  }

  async function handleGoogleSignUp() {
    if (pending) return

    setError(null)
    setPending(true)

    try {
      const { error: authError } = await authClient.signIn.social({
        provider: "google",
        callbackURL: returnUrl,
      })

      if (authError) {
        showAuthError(
          authError.message || "Google sign-up is not available right now."
        )
        setPending(false)
      }
    } catch {
      showAuthError("Google sign-up is not available right now.")
      setPending(false)
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Join GreenHands to organize and join community events
        </CardDescription>
        <CardAction>
          <Link href={`/login?returnUrl=${encodeURIComponent(returnUrl)}`}>
            <Button variant="link" type="button">
              Log In
            </Button>
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form id="signup-form" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
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
                autoComplete="new-password"
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters long.
              </p>
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
        <Button type="submit" form="signup-form" className="w-full" disabled={pending}>
          {pending ? "Creating account…" : "Sign Up"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={pending}
          onClick={handleGoogleSignUp}
        >
          Sign Up with Google
        </Button>
      </CardFooter>
    </Card>
  )
}
