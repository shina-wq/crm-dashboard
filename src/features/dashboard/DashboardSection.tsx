import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type DashboardSectionProps = {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
}

export function DashboardSection({ title, subtitle, children, className }: DashboardSectionProps) {
  return (
    <section className={cn("rounded-xl border border-border bg-card p-6 shadow-sm", className)}>
      <h2 className="font-heading text-base font-semibold text-foreground">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </section>
  )
}