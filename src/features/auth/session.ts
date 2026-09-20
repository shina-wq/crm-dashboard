import { z } from "zod"
import type { AuthUser } from "@/types/auth"

export const SESSION_KEY = "crm-session"
export const SESSION_MINUTES = 60

const sessionSchema = z.object({
  user: z.object({
    id: z.number(),
    username: z.string(),
    firstName: z.string(),
    lastName: z.string(),
  }),
  expiresAt: z.number(),
})

// Returns null for missing, corrupt, or expired sessions, and clears the bad entry.
export function readSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (raw) {
      const parsed = sessionSchema.safeParse(JSON.parse(raw))
      if (parsed.success && parsed.data.expiresAt > Date.now()) return parsed.data.user
      localStorage.removeItem(SESSION_KEY)
    }
  } catch {
    // Unreadable storage or invalid JSON: treat as signed out.
  }
  return null
}

export function writeSession(user: AuthUser) {
  const expiresAt = Date.now() + SESSION_MINUTES * 60_000
  localStorage.setItem(SESSION_KEY, JSON.stringify({ user, expiresAt }))
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}