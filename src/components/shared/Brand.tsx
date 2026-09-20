import { BarChart3 } from "lucide-react"

export function Brand() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
        <BarChart3 className="size-4 text-primary-foreground" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-medium leading-none text-foreground">CRM</p>
        <p className="mt-1 text-xs text-muted-foreground">Customer Intelligence</p>
      </div>
    </div>
  )
}