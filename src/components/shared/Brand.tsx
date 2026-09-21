import { BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary">
        <BarChart3 className="size-4 text-primary-foreground" aria-hidden="true" />
      </div>
      <div className={cn(compact && "sr-only")}>
        <p className="text-sm font-medium leading-none text-foreground">CRM</p>
        <p className="mt-1 text-xs text-muted-foreground">Customer Intelligence</p>
      </div>
    </div>
  )
}