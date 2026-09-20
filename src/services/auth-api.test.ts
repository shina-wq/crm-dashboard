import { afterEach, describe, expect, it, vi } from "vitest"
import { apiClient } from "./api-client"
import { login } from "./auth-api"

afterEach(() => vi.restoreAllMocks())

describe("login", () => {
  it("posts the credentials and returns only the identity fields", async () => {
    const post = vi.spyOn(apiClient, "post").mockResolvedValue({
      id: 1,
      username: "emilys",
      firstName: "Emily",
      lastName: "Johnson",
      email: "emily@example.com",
      accessToken: "secret",
      refreshToken: "also-secret",
    })

    const user = await login("emilys", "emilyspass")

    expect(post).toHaveBeenCalledWith("/auth/login", { username: "emilys", password: "emilyspass" })
    expect(user).toEqual({ id: 1, username: "emilys", firstName: "Emily", lastName: "Johnson" })
  })

  it("throws when the response is malformed", async () => {
    vi.spyOn(apiClient, "post").mockResolvedValue({ message: "hi" })
    await expect(login("emilys", "emilyspass")).rejects.toThrow()
  })

  it("propagates request errors", async () => {
    vi.spyOn(apiClient, "post").mockRejectedValue(new Error("network down"))
    await expect(login("emilys", "emilyspass")).rejects.toThrow("network down")
  })
})