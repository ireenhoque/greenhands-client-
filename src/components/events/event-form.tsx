"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, type FormEvent } from "react"
import {
  AlertCircle,
  ArrowLeft,
  CalendarPlus,
  CheckCircle2,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { authClient } from "@/lib/auth-client"
import {
  createEvent,
  EventsApiError,
  fetchEventCategories,
  updateEvent,
  type EventInput,
  type RecentEvent,
} from "@/lib/api/events"

type EventFormProps = {
  /** create = POST /events, edit = PUT /events/:id with initial values. */
  mode: "create" | "edit"
  /** The event being edited (edit mode only). */
  event?: RecentEvent
}

type FormErrors = Partial<Record<keyof EventInput, string>>

/**
 * Local date (yyyy-mm-dd) for the date input — shift the UTC ISO value into
 * the browser's timezone first so an event created at, say, 10:00 local is
 * not shown as the previous/next day.
 */
function toDateInputValue(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return ""
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

function todayInputValue(): string {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

/**
 * Quick photo presets straight from the reference design: real organizer
 * photos already used by existing events (Unsplash, whitelisted in
 * next.config.ts), so no placeholder services are introduced.
 */
const PHOTO_PRESETS = [
  { label: "Winter Clothes", url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=60" },
  { label: "Blanket Relief", url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=60" },
  { label: "Cleanup", url: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=60" },
  { label: "Tree Plantation", url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=60" },
]

export function EventForm({ mode, event }: EventFormProps) {
  const router = useRouter()

  const [title, setTitle] = useState(event?.title ?? "")
  const [eventType, setEventType] = useState(event?.eventType ?? "")
  const [eventDate, setEventDate] = useState(
    event?.eventDate ? toDateInputValue(event.eventDate) : ""
  )
  const [location, setLocation] = useState(event?.location ?? "")
  const [imageUrl, setImageUrl] = useState(event?.imageUrl ?? "")
  const [description, setDescription] = useState(event?.description ?? "")

  // Categories come from the real event data (GET /events/categories)...
  const [categories, setCategories] = useState<string[] | null>(null)
  // ...and the signed-in organizer's email shows in the footer (design ref).
  const { data: session } = authClient.useSession()

  // "Today" for the date input's min attribute. Computed in an effect (not
  // during render) because the static prerender must not bake in a date —
  // cacheComponents rejects unstable time values in client renders.
  const [today, setToday] = useState("")

  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({})
  const [success, setSuccess] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    setToday(todayInputValue())
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchEventCategories(controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) setCategories(items)
      })
      .catch((fetchError: unknown) => {
        if (controller.signal.aborted) return
        // Non-fatal: the organizer can still retry by submitting later after
        // refreshing, or type stays empty — never invent placeholder types.
        setError(
          fetchError instanceof EventsApiError
            ? fetchError.message
            : "Could not load event categories."
        )
      })

    return () => controller.abort()
  }, [])

  const dateMin = today || undefined

  function validate(): FormErrors {
    const errors: FormErrors = {}

    if (!title.trim()) errors.title = "Event title is required."
    if (!eventType) errors.eventType = "Choose a category."
    if (!eventDate) {
      errors.eventDate = "Event date is required."
    } else if (today && eventDate < today) {
      errors.eventDate = "Date must be today or later."
    }
    if (!location.trim()) errors.location = "Location is required."
    if (!imageUrl.trim()) {
      errors.imageUrl = "Thumbnail image URL is required."
    } else if (!/^https?:\/\//i.test(imageUrl.trim())) {
      errors.imageUrl = "Use an http(s) image URL."
    }
    if (!description.trim()) errors.description = "Event description is required."

    return errors
  }

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault()
    if (pending) return

    setError(null)
    setSuccess(null)

    const validation = validate()
    setFieldErrors(validation)
    if (Object.keys(validation).length > 0) return

    setPending(true)
    try {
      // The organizer is attached server-side from the signed-in session —
      // the client never supplies identity.
      const payload: EventInput = {
        title: title.trim(),
        eventType,
        // Midnight of the chosen day — server keeps it as an ISO timestamp.
        eventDate: new Date(`${eventDate}T00:00:00`).toISOString(),
        location: location.trim(),
        imageUrl: imageUrl.trim(),
        description: description.trim(),
      }

      const saved =
        mode === "create"
          ? await createEvent(payload)
          : await updateEvent(event!._id, payload)

      setSuccess("Event saved successfully.")

      const redirectTo =
        mode === "create"
          ? "/dashboard/manage-events"
          : `/events/${saved._id}`
      router.push(redirectTo)
      router.refresh()
    } catch (submitError) {
      setError(
        submitError instanceof EventsApiError
          ? submitError.message
          : "Something went wrong while saving the event."
      )
      setPending(false)
    }
  }

  const fieldErrorClass = (fieldError?: string) =>
    fieldError ? "border-destructive focus-visible:ring-destructive/30" : undefined

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {error ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      ) : null}

      {success ? (
        <p
          role="status"
          className="flex items-start gap-2 rounded-2xl border border-brand-sage/40 bg-brand-soft-sage/40 p-4 text-sm text-brand-forest dark:text-brand-soft-sage"
        >
          <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0" />
          {success}
        </p>
      ) : null}

      {/* Event Title */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="event-title">
          Event Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="event-title"
          value={title}
          onChange={(changeEvent) => setTitle(changeEvent.target.value)}
          placeholder="e.g. Winter Clothes Distribution — Mirpur 10, Dhaka"
          required
          aria-invalid={Boolean(fieldErrors.title)}
          className={fieldErrorClass(fieldErrors.title)}
        />
        {fieldErrors.title ? (
          <p className="text-xs text-destructive">{fieldErrors.title}</p>
        ) : null}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Event Type */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="event-type">
            Event Type <span className="text-destructive">*</span>
          </Label>
          <select
            id="event-type"
            value={eventType}
            onChange={(changeEvent) => setEventType(changeEvent.target.value)}
            required
            aria-invalid={Boolean(fieldErrors.eventType)}
            className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:bg-input/30"
          >
            <option value="" disabled>
              {categories === null ? "Loading categories…" : "Select a category"}
            </option>
            {(categories ?? []).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {fieldErrors.eventType ? (
            <p className="text-xs text-destructive">{fieldErrors.eventType}</p>
          ) : null}
        </div>

        {/* Event Date */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="event-date">
            Event Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="event-date"
            type="date"
            min={dateMin}
            value={eventDate}
            onChange={(changeEvent) => setEventDate(changeEvent.target.value)}
            required
            aria-invalid={Boolean(fieldErrors.eventDate)}
            className={fieldErrorClass(fieldErrors.eventDate)}
          />
          <p className="text-xs text-muted-foreground">
            Dates must be in the future (today or later).
          </p>
        </div>
      </div>

      {/* Location / Venue */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="event-location">
          Location / Venue <span className="text-destructive">*</span>
        </Label>
        <Input
          id="event-location"
          value={location}
          onChange={(changeEvent) => setLocation(changeEvent.target.value)}
          placeholder="e.g. Mohammadpur Town Hall, Dhaka"
          required
          aria-invalid={Boolean(fieldErrors.location)}
          className={fieldErrorClass(fieldErrors.location)}
        />
        {fieldErrors.location ? (
          <p className="text-xs text-destructive">{fieldErrors.location}</p>
        ) : null}
      </div>

      {/* Thumbnail Image URL */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="event-image">
          Thumbnail Image URL <span className="text-destructive">*</span>
        </Label>
        <Input
          id="event-image"
          type="url"
          value={imageUrl}
          onChange={(changeEvent) => setImageUrl(changeEvent.target.value)}
          placeholder="https://images.unsplash.com/photo-…"
          required
          aria-invalid={Boolean(fieldErrors.imageUrl)}
          className={fieldErrorClass(fieldErrors.imageUrl)}
        />
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="font-medium">Quick photo presets:</span>
          {PHOTO_PRESETS.map((preset, index) => (
            <span key={preset.label} className="flex items-center gap-2">
              {index > 0 ? <span aria-hidden>·</span> : null}
              <button
                type="button"
                onClick={() => setImageUrl(preset.url)}
                className="font-medium text-brand-forest underline-offset-4 hover:underline dark:text-brand-soft-sage"
              >
                {preset.label}
              </button>
            </span>
          ))}
        </div>
        {fieldErrors.imageUrl ? (
          <p className="text-xs text-destructive">{fieldErrors.imageUrl}</p>
        ) : null}
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="event-description">
          Event Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="event-description"
          value={description}
          onChange={(changeEvent) => setDescription(changeEvent.target.value)}
          placeholder="Explain the purpose of the drive, volunteers required, items being distributed or tasks to complete…"
          rows={5}
          required
          aria-invalid={Boolean(fieldErrors.description)}
          className={fieldErrorClass(fieldErrors.description)}
        />
        {fieldErrors.description ? (
          <p className="text-xs text-destructive">{fieldErrors.description}</p>
        ) : null}
      </div>

      {/* Organizer footer + submit. The backend attaches the organizer from
          the Better Auth session; the email below is display-only. */}
      <div className="flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Organizer Email attached:{" "}
          <span className="font-medium text-foreground">
            {session?.user?.email ?? "—"}
          </span>
        </p>

        <Button
          type="submit"
          disabled={pending}
          className="w-full bg-brand-forest text-brand-ivory hover:bg-brand-forest/90 sm:w-auto"
        >
          {pending ? (
            <Loader2 data-icon="inline-start" aria-hidden className="animate-spin" />
          ) : (
            <CalendarPlus data-icon="inline-start" />
          )}
          {pending
            ? mode === "create"
              ? "Creating event…"
              : "Saving changes…"
            : mode === "create"
              ? "Create Community Event"
              : "Save Changes"}
        </Button>
      </div>

      <Link
        href="/events"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-brand-forest dark:hover:text-brand-soft-sage"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Back to Upcoming Events
      </Link>
    </form>
  )
}
