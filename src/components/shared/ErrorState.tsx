import { CircleAlert, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ApiError } from "@/services/api-client"
import { cn } from "@/lib/utils"

type ErrorStateProps = {
  error?: unknown
  title?: string
  onRetry?: () => void
  icon?: LucideIcon
  className?: string
}

function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status >= 500) return "The server had a problem. This is likely temporary."
    if (error.status === 404) return "The requested data couldn't be found."
    return "The request couldn't be completed."
  }
  if (error instanceof TypeError) return "Can't reach the server. Check your connection."
  return "An unexpected error occurred while loading this data."
}

export function ErrorState({
  error,
  title = "Couldn't load this data",
  onRetry,
  icon: Icon = CircleAlert,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-danger/40 px-6 py-16 text-center",
        className
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-full bg-danger">
        <Icon className="size-5 text-danger-foreground" aria-hidden="true" />
      </div>

      <div className="max-w-sm">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{describeError(error)}</p>
      </div>

      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}