/**
 * Events API client — the single place the backend base URL and response
 * envelope are handled. Components must not hardcode the server URL.
 *
 * Response shape (inspected from the running Express API):
 *   GET {NEXT_PUBLIC_SERVER_BASE_URL}/events/recent
 *   → { success: true, message: "...", data: Event[] }   (up to 6, soonest first)
 *
 * Event document fields (inspected from the MongoDB `events` collection):
 *   _id, title, description, eventType, imageUrl, location, eventDate,
 *   organizerName, organizerEmail, createdAt, updatedAt
 */
export type RecentEvent = {
  _id: string
  title: string
  description?: string | null
  eventType?: string | null
  imageUrl?: string | null
  location?: string | null
  /** ISO date string (serialized from Mongo). */
  eventDate: string
  organizerName?: string | null
  organizerEmail?: string | null
  createdAt?: string
  updatedAt?: string
}

type RecentEventsResponse = {
  success: boolean
  message: string
  data: RecentEvent[]
}

type EventResponse = {
  success: boolean
  message: string
  data: RecentEvent
}

const BASE_URL = (process.env.NEXT_PUBLIC_SERVER_BASE_URL ?? "")
  .trim()
  .replace(/\/+$/, "")

/** Thrown for every non-success outcome so callers can show one error state. */
export class EventsApiError extends Error {}

/**
 * Fetches the most recent upcoming events from the Express API.
 *
 * @param signal optional AbortSignal — pass the signal from a useEffect cleanup
 *               so stale requests are cancelled on unmount/retry.
 * @throws {EventsApiError} with a human-readable message on any failure.
 */
export async function fetchRecentEvents(
  signal?: AbortSignal
): Promise<RecentEvent[]> {
  if (!BASE_URL) {
    throw new EventsApiError(
      "NEXT_PUBLIC_SERVER_BASE_URL is not set. Add it to .env.local, e.g. NEXT_PUBLIC_SERVER_BASE_URL=http://localhost:5000"
    )
  }

  let response: Response
  try {
    response = await fetch(`${BASE_URL}/events/recent`, {
      signal,
      headers: { accept: "application/json" },
    })
  } catch (error) {
    // Aborted requests are not failures — rethrow for the caller to ignore.
    if (signal?.aborted) throw error
    throw new EventsApiError(
      `Could not reach the events API at ${BASE_URL}. Make sure the GreenHands server is running.`
    )
  }

  if (!response.ok) {
    throw new EventsApiError(
      `Events API request failed with status ${response.status}${
        response.statusText ? ` ${response.statusText}` : ""
      }.`
    )
  }

  let payload: RecentEventsResponse
  try {
    payload = (await response.json()) as RecentEventsResponse
  } catch {
    throw new EventsApiError("Events API returned an unreadable response.")
  }

  if (payload.success !== true || !Array.isArray(payload.data)) {
    throw new EventsApiError(
      payload.message || "Events API returned an unexpected response."
    )
  }

  // The API already limits to 6 — enforce it here too so the UI can rely on it.
  return payload.data.slice(0, 6)
}


/**
 * Fetches one event by its MongoDB ID.
 */
export async function fetchEventById(
  id: string,
  signal?: AbortSignal
): Promise<RecentEvent> {
  if (!BASE_URL) {
    throw new EventsApiError(
      "NEXT_PUBLIC_SERVER_BASE_URL is not set. Add it to .env.local."
    )
  }

  let response: Response

  try {
    response = await fetch(`${BASE_URL}/events/${encodeURIComponent(id)}`, {
      signal,
      headers: {
        accept: "application/json",
      },
      cache: "no-store",
    })
  } catch (error) {
    if (signal?.aborted) throw error

    throw new EventsApiError(
      `Could not reach the events API at ${BASE_URL}. Make sure the GreenHands server is running.`
    )
  }

  let payload: EventResponse | { success: false; message: string }

  try {
    payload = await response.json()
  } catch {
    throw new EventsApiError("Events API returned an unreadable response.")
  }

  if (!response.ok || payload.success !== true) {
    throw new EventsApiError(
      payload.message || `Event request failed with status ${response.status}.`
    )
  }

  return payload.data
}


/**
 * Fetches all upcoming events from the Express API.
 */
export async function fetchUpcomingEvents(
  signal?: AbortSignal
): Promise<RecentEvent[]> {
  if (!BASE_URL) {
    throw new EventsApiError(
      "NEXT_PUBLIC_SERVER_BASE_URL is not set. Add it to .env.local."
    )
  }

  let response: Response

  try {
    response = await fetch(`${BASE_URL}/events`, {
      signal,
      headers: {
        accept: "application/json",
      },
      cache: "no-store",
    })
  } catch (error) {
    if (signal?.aborted) throw error

    throw new EventsApiError(
      `Could not reach the events API at ${BASE_URL}. Make sure the GreenHands server is running.`
    )
  }

  let payload: RecentEventsResponse

  try {
    payload = await response.json()
  } catch {
    throw new EventsApiError("Events API returned an unreadable response.")
  }

  if (!response.ok || payload.success !== true || !Array.isArray(payload.data)) {
    throw new EventsApiError(
      payload.message || `Events request failed with status ${response.status}.`
    )
  }

  return payload.data
}