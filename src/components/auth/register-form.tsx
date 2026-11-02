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
import { toast } from "@/components/ui/toast"
import { authClient } from "@/lib/auth-client"

/** Assignment rule: minimum 6 characters, at least one upper- and lowercase. */
const MIN_PASSWORD_LENGTH = 6

/**
 * Returns the first rule the password violates, or null when it complies.
 * The form never calls Better Auth with an invalid password.
 */
function passwordValidationError(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter."
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter."
  }
  return null
}

/** Same open-redirect defense as the login and sign-up forms. */
function sanitizeReturnUrl(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/"
}

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = sanitizeReturnUrl(searchParams.get("returnUrl"))

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  function showAuthError(message?: string | null) {
    const text = message || "Could not create your account. Please try again."
    setError(text)
    toast.add({
      type: "error",
      title: "Registration failed",
      description: text,
    })
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    // Client-side password policy — reject before anything reaches the
    // auth server, with both an inline error and a toast.
    const passwordError = passwordValidationError(password)
    if (passwordError) {
      setError(passwordError)
      toast.add({
        type: "warning",
        title: "Invalid password",
        description: passwordError,
      })
      return
    }

    setError(null)
    setPending(true)

    try {
      const { error: authError } = await authClient.signUp.email({
        name,
        email,
        password,
        // Assignment mapping: Photo URL → Better Auth's user image field.
        ...(photoUrl.trim() ? { image: photoUrl.trim() } : {}),
        // Creating the account also signs the user in (Better Auth's
        // autoSignIn default), so the same return-URL flow as login applies.
        callbackURL: returnUrl,
      })

      if (authError) {
        // e.g. an already-registered email surfaces its server message here;
        // the user stays on this page either way.
        showAuthError(authError.message)
        return
      }

      toast.add({
        type: "success",
        title: "Account created!",
        description: "Welcome to GreenHands — happy volunteering.",
      })

      router.push(returnUrl)
      router.refresh()
    } catch {
      showAuthError()
    } finally {
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
        <form id="register-form" onSubmit={handleSubmit}>
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
              <Label htmlFor="image">Photo URL</Label>
              <Input
                id="image"
                name="image"
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={photoUrl}
                onChange={(event) => setPhotoUrl(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Optional — used as the avatar shown across the site.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                At least {MIN_PASSWORD_LENGTH} characters, with one uppercase
                and one lowercase letter.
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
        <Button type="submit" form="register-form" className="w-full" disabled={pending}>
          {pending ? "Creating account…" : "Register"}
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
