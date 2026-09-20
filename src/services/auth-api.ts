import { apiClient } from "./api-client"
import { dummyJsonLoginSchema } from "@/types/dummyjson"
import type { AuthUser } from "@/types/auth"

// DummyJSON also returns access and refresh tokens. We drop them: none of its data
// endpoints need one, so storing a token would only add something to steal.
export async function login(username: string, password: string): Promise<AuthUser> {
  const raw = await apiClient.post<unknown>("/auth/login", { username, password })
  const res = dummyJsonLoginSchema.parse(raw)

  return {
    id: res.id,
    username: res.username,
    firstName: res.firstName,
    lastName: res.lastName,
  }
}