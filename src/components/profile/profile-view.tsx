"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState, type FormEvent } from "react"
import { Loader2, Save } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"

type FieldErrors = {
  name?: string
  imageUrl?: string
}

const NAME_MAX_LENGTH = 80

/**
 * Profile view + update.
 *
 * Data comes from the signed-in Better Auth session (authClient.useSession)
 * — Better Auth's `user` collection is the single source of truth, and this
 * app keeps no duplicate profile store. Updates go through Better Auth's
 * updateUser, which is authorized server-side by the session, so only the
 * signed-in user's own row can ever change (email/role/password are not
 * part of this form).
 *
 * State flow on save: success → toast + router.refresh() — the session hook
 * refreshes this card, and the re-render means the navbar's server-streamed
 * session user picks up the new name/avatar too.
 */
export function ProfileView() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const user = session?.user ?? null

  // Typed values take priority; before any edits the form simply derives
  // from the live session (no effect needed). After a save both edit fields
  // reset to null, so the form snaps to the freshly saved session profile.
  const [editedName, setEditedName] = useState<string | null>(null)
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null)
  const name = editedName ?? user?.name ?? ""
  const imageUrl = editedImageUrl ?? user?.image ?? ""

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [pending, setPending] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const initials = useMemo(() => {
    const loadedName = user?.name ?? ""
    return (
      loadedName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || "?"
    )
  }, [user?.name])

  function validate(nextName: string, nextImageUrl: string): FieldErrors {
    const errors: FieldErrors = {}
    const trimmedName = nextName.trim()

    if (!trimmedName) {
      errors.name = "Name is required."
    } else if (trimmedName.length > NAME_MAX_LENGTH) {
      errors.name = `Name must be ${NAME_MAX_LENGTH} characters or fewer.`
    }

    const trimmedUrl = nextImageUrl.trim()
    if (trimmedUrl && !/^https?:\/\//i.test(trimmedUrl)) {
      errors.imageUrl = "Use an http(s) image URL."
    }

    return errors
  }

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault()
    if (pending) return

    const nextName = name.trim()
    const nextImageUrl = imageUrl.trim()

    // Client-side validation runs first; the same constraints hold on the
    // Better Auth server, so nothing invalid is ever sent there.
    const validation = validate(nextName, nextImageUrl)
    setFieldErrors(validation)
    if (Object.keys(validation).length > 0) return

    setPending(true)
    try {
      const { error: updateError } = await authClient.updateUser({
        name: nextName,
        // Empty URL explicitly clears the picture (Better Auth's image
        // field is nullable); a URL replaces it.
        image: nextImageUrl ? nextImageUrl : null,
      })

      if (updateError) {
        toast.add({
          type: "error",
          title: "Could not update your profile",
          description: updateError.message || "Please try again in a moment.",
        })
        return
      }

      toast.add({
        type: "success",
        title: "Profile updated",
        description: "Your changes are now visible to others.",
      })
      setSavedAt(Date.now())
      setFieldErrors({})
      // Drop the edit values so the form mirrors the saved session profile.
      setEditedName(null)
      setEditedImageUrl(null)

      // Re-render server components so the navbar avatar/name update too.
      router.refresh()
    } catch {
      toast.add({
        type: "error",
        title: "Could not update your profile",
        description: "Please check your connection and try again.",
      })
    } finally {
      setPending(false)
    }
  }

  const fieldErrorClass = (fieldError?: string) =>
    fieldError
      ? "border-destructive focus-visible:ring-destructive/30"
      : undefined

  return (
    <div className="mt-10 rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-10">
      {/* Identity header — always rendered from live session data. */}
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <Avatar className="size-20">
          <AvatarImage src={user?.image ?? undefined} alt="" />
          <AvatarFallback className="bg-brand-soft-sage text-xl font-semibold text-brand-forest dark:bg-brand-sage/15 dark:text-brand-soft-sage">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <h2 className="truncate text-xl font-semibold text-foreground">
            {user?.name ?? "—"}
          </h2>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {user?.email ?? "—"}
          </p>
        </div>
      </div>

      {/* Update form */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-10 flex flex-col gap-6 border-t border-border/70 pt-8"
      >
        {/* Name */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="profile-name">
            Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="profile-name"
            value={name}
            onChange={(changeEvent) => setEditedName(changeEvent.target.value)}
            placeholder="e.g. Amina Chowdhury"
            required
            maxLength={NAME_MAX_LENGTH}
            disabled={isPending || pending}
            aria-invalid={Boolean(fieldErrors.name)}
            className={fieldErrorClass(fieldErrors.name)}
          />
          {fieldErrors.name ? (
            <p className="text-xs text-destructive">{fieldErrors.name}</p>
          ) : null}
        </div>

        {/* Email (identity — never editable through this form) */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="profile-email">Email</Label>
          <Input
            id="profile-email"
            name="profileEmail"
            type="email"
            value={user?.email ?? ""}
            readOnly
            aria-readonly="true"
            className="cursor-not-allowed bg-input/50"
          />
          <p className="text-xs text-muted-foreground">
            Your email is part of your sign-in identity and cannot be changed
            here.
          </p>
        </div>

        {/* Profile picture URL */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="profile-image">Profile Picture URL</Label>
          <Input
            id="profile-image"
            type="url"
            value={imageUrl}
            onChange={(changeEvent) => setEditedImageUrl(changeEvent.target.value)}
            placeholder="https://images.unsplash.com/photo-…"
            disabled={isPending || pending}
            aria-invalid={Boolean(fieldErrors.imageUrl)}
            className={fieldErrorClass(fieldErrors.imageUrl)}
          />
          <p className="text-xs text-muted-foreground">
            Leave empty to remove your picture. Shown next to your name and in
            the account menu.
          </p>
          {fieldErrors.imageUrl ? (
            <p className="text-xs text-destructive">{fieldErrors.imageUrl}</p>
          ) : null}
        </div>

        {/* Submit row */}
        <div className="flex flex-col gap-4 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {savedAt
              ? "Your profile is up to date."
              : "Changes save to your account immediately."}
          </p>

          <Button
            type="submit"
            disabled={pending || isPending}
            className="w-full bg-brand-forest text-brand-ivory hover:bg-brand-forest/90 sm:w-auto"
          >
            {pending ? (
              <Loader2 data-icon="inline-start" aria-hidden className="animate-spin" />
            ) : (
              <Save data-icon="inline-start" />
            )}
            {pending ? "Saving changes…" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
