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
 *   (+ joinerCount on single-event reads — additive, from the join system)
 *
 * Auth: write/owner endpoints (create, edit, delete, mine, joined, join)
 * require the Better Auth session cookie. Fetches use `credentials:
 * "include"` so the cookie flows from the app origin to the API origin
 * (cross-port in dev — localhost:3000 → localhost:5000); the server's CORS
 * config already allows this, and the exchange never sees the cookie value.
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

/**
 * The form payload for creating/updating an event. organizerName and
 * organizerEmail are deliberately NOT part of this type — the backend
 * attaches them from the verified Better Auth session, so the client never
 * sends identity.
 */
export type EventInput = {
  title: string
  eventType: string
  eventDate: string
  location: string
  imageUrl: string
  description: string
}

/** Event categories (distinct `eventType` values from the real data). */
export async function fetchEventCategories(
  signal?: AbortSignal
): Promise<string[]> {
  if (!BASE_URL) {
    throw new EventsApiError(
      "NEXT_PUBLIC_SERVER_BASE_URL is not set. Add it to .env.local."
    )
  }

  let response: Response
  try {
    response = await fetch(`${BASE_URL}/events/categories`, {
      signal,
      headers: { accept: "application/json" },
    })
  } catch (error) {
    if (signal?.aborted) throw error
    throw new EventsApiError(
      `Could not reach the events API at ${BASE_URL}. Make sure the GreenHands server is running.`
    )
  }

  if (!response.ok) {
    throw new EventsApiError(
      `Categories request failed with status ${response.status}.`
    )
  }

  let payload: { success: boolean; message: string; data: unknown }
  try {
    payload = await response.json()
  } catch {
    throw new EventsApiError("Events API returned an unreadable response.")
  }

  if (
    payload.success !== true ||
    !Array.isArray(payload.data) ||
    !payload.data.every((category) => typeof category === "string")
  ) {
    throw new EventsApiError(
      payload.message || "Category request returned an unexpected response."
    )
  }

  return payload.data
}

type AuthedRequestInit = {
  method: "GET" | "POST" | "PUT" | "DELETE"
  signal?: AbortSignal
  /** JSON body for POST/PUT; GET/DELETE pass nothing. */
  body?: unknown
}

/**
 * Internal helper for session-scoped API calls. Sends the auth cookie and
 * the standard JSON headers, applies `cache: "no-store"` so edited lists
 * never show a cached copy, and normalizes errors to EventsApiError with the
 * server's message (including 401/403 responses from the auth middleware).
 */
async function authedRequest(
  path: string,
  { method, signal, body }: AuthedRequestInit
): Promise<unknown> {
  if (!BASE_URL) {
    throw new EventsApiError(
      "NEXT_PUBLIC_SERVER_BASE_URL is not set. Add it to .env.local."
    )
  }

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        accept: "application/json",
        ...(body !== undefined ? { "content-type": "application/json" } : {}),
      },
      credentials: "include",
      cache: "no-store",
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      signal,
    })
  } catch (error) {
    if (signal?.aborted) throw error
    throw new EventsApiError(
      `Could not reach the events API at ${BASE_URL}. Make sure the GreenHands server is running.`
    )
  }

  let payload: { success: boolean; message: string; data?: unknown }
  try {
    payload = await response.json()
  } catch {
    throw new EventsApiError("Events API returned an unreadable response.")
  }

  if (!response.ok || payload.success !== true) {
    throw new EventsApiError(
      payload.message ||
        `Request failed with status ${response.status}.${
          response.statusText ? ` ${response.statusText}` : ""
        }`
    )
  }

  return payload
}

/** Helper that narrows a `{ data: T[] }` payload from authedRequest. */
function asData<T = unknown>(payload: unknown): T {
  const data = (payload as { data?: T }).data
  if (data === undefined) {
    throw new EventsApiError("Events API response is missing data.")
  }
  return data
}

/** Events created by the signed-in user (organizer view). */
export function fetchMyEvents(signal?: AbortSignal): Promise<RecentEvent[]> {
  return authedRequest("/events/mine", { method: "GET", signal }).then(
    (payload) => asData<RecentEvent[]>(payload)
  )
}

/** Events the signed-in user has joined. */
export function fetchJoinedEvents(signal?: AbortSignal): Promise<RecentEvent[]> {
  return authedRequest("/events/joined", { method: "GET", signal }).then(
    (payload) => asData<RecentEvent[]>(payload)
  )
}

/** Creates the event; the backend attaches the organizer from the session. */
export function createEvent(input: EventInput): Promise<RecentEvent> {
  return authedRequest("/events", { method: "POST", body: input }).then(
    (payload) => asData<RecentEvent>(payload)
  )
}

/** Updates an own event; the backend rejects other organizers with 403. */
export function updateEvent(
  id: string,
  input: EventInput
): Promise<RecentEvent> {
  return authedRequest(`/events/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: input,
  }).then((payload) => asData<RecentEvent>(payload))
}

/** Deletes an own event; the backend rejects other organizers with 403. */
export function deleteEvent(id: string): Promise<unknown> {
  return authedRequest(`/events/${encodeURIComponent(id)}`, {
    method: "DELETE",
  })
}

/** Whether the signed-in user has joined an event (+ the joiner count). */
export function fetchJoinState(
  eventId: string,
  signal?: AbortSignal
): Promise<{ joined: boolean; joinerCount: number }> {
  return authedRequest(
    `/events/${encodeURIComponent(eventId)}/join-state`,
    { method: "GET", signal }
  ).then((payload) =>
    asData<{ joined: boolean; joinerCount: number }>(payload)
  )
}

/** Joins the event with the signed-in user (persistent DB relationship). */
export function joinEvent(
  eventId: string
): Promise<{ joined: boolean; joinerCount: number }> {
  return authedRequest(`/events/${encodeURIComponent(eventId)}/join`, {
    method: "POST",
    body: {},
  }).then((payload) =>
    asData<{ joined: boolean; joinerCount: number }>(payload)
  )
}

/** Removes the signed-in user's join record for the event. */
export function leaveEvent(
  eventId: string
): Promise<{ joined: boolean; joinerCount: number }> {
  return authedRequest(`/events/${encodeURIComponent(eventId)}/join`, {
    method: "DELETE",
  }).then((payload) =>
    asData<{ joined: boolean; joinerCount: number }>(payload)
  )
}