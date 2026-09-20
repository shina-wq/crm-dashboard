import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { makeAuthUser } from "@/test/factories"
import { clearSession, readSession, SESSION_KEY, SESSION_MINUTES, writeSession } from "./session"

beforeEach(() => localStorage.clear())
afterEach(() => vi.useRealTimers())

describe("session", () => {
  it("returns null when nothing is stored", () => {
    expect(readSession()).toBeNull()
  })

  it("returns the user that was written", () => {
    const user = makeAuthUser()
    writeSession(user)
    expect(readSession()).toEqual(user)
  })

  it("returns null and clears the entry once it has expired", () => {
    vi.useFakeTimers()
    writeSession(makeAuthUser())

    vi.setSystemTime(Date.now() + (SESSION_MINUTES + 1) * 60_000)

    expect(readSession()).toBeNull()
    expect(localStorage.getItem(SESSION_KEY)).toBeNull()
  })

  it.each([
    ["invalid JSON", "{nope"],
    ["the wrong shape", JSON.stringify({ user: {}, expiresAt: "soon" })],
  ])("returns null for %s", (_label, stored) => {
    localStorage.setItem(SESSION_KEY, stored)
    expect(readSession()).toBeNull()
  })

  it("clears the session", () => {
    writeSession(makeAuthUser())
    clearSession()
    expect(readSession()).toBeNull()
  })
})