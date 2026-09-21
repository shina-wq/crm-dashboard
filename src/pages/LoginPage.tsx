import { Navigate, useLocation } from "react-router-dom"
import { Brand } from "@/components/shared/Brand"
import { useAuth } from "@/features/auth/auth-context"
import { LoginForm } from "@/features/auth/LoginForm"
import { LoginIllustration } from "@/features/auth/LoginIllustration"

type LocationState = { from?: string } | null

export function LoginPage() {
  const { user } = useAuth()
  const location = useLocation()
  const from = (location.state as LocationState)?.from ?? "/dashboard"

  if (user) return <Navigate to={from} replace />

  return (
    <main className="grid min-h-dvh bg-background lg:grid-cols-2">
      <div className="flex flex-col px-6 py-6 sm:px-10 sm:py-8">
        <Brand />

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="text-xl font-medium text-foreground">Sign in</h1>
          <p className="mb-6 mt-1 text-sm text-muted-foreground">
            Enter your details to open the dashboard.
          </p>
          <LoginForm />
        </div>
      </div>

      <div className="hidden items-center justify-center border-l border-border bg-muted bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[20px_20px] p-12 lg:flex">

        <LoginIllustration />
      </div>
    </main>
  )
}