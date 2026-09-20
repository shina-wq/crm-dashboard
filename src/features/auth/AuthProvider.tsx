import { useCallback, useMemo, useState, type ReactNode } from "react"
import { login } from "@/services/auth-api"
import type { AuthUser } from "@/types/auth"
import { AuthContext } from "./auth-context"
import { clearSession, readSession, writeSession } from "./session"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readSession)

  const signIn = useCallback(async (username: string, password: string) => {
    const next = await login(username, password)
    writeSession(next)
    setUser(next)
  }, [])

  const signOut = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, signIn, signOut }), [user, signIn, signOut])

  return <AuthContext value={value}>{children}</AuthContext>
}