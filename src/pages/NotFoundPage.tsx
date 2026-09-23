import { Link } from "react-router-dom"
import { Compass } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Brand } from "@/components/shared/Brand"
import { useAuth } from "@/features/auth/auth-context"

export function NotFoundPage() {
  const { user } = useAuth()

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <Brand />

      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Compass className="size-6 text-muted-foreground" aria-hidden="true" />
      </div>

      <div className="max-w-sm">
        <p className="text-5xl font-semibold tracking-tight text-foreground">404</p>
        <h1 className="mt-2 text-lg font-medium text-foreground">Page not found</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or was moved.
        </p>
      </div>

      <Button asChild>
        <Link to={user ? "/dashboard" : "/login"}>
          {user ? "Back to dashboard" : "Back to sign in"}
        </Link>
      </Button>
    </main>
  )
}