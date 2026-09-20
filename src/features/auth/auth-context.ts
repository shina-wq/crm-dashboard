import { createContext, use } from "react"
import type { AuthUser } from "@/types/auth"

export type AuthContextValue = {
  user: AuthUser | null
  signIn: (username: string, password: string) => Promise<void>
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const value = use(AuthContext)
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>")
  return value
}