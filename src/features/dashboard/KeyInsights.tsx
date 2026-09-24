import { Link } from "react-router-dom"
import { Lightbulb, ArrowRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { Insight } from "@/lib/insights"

type KeyInsightsProps = {
  insights: Insight[]
}

export function KeyInsights({ insights }: KeyInsightsProps) {
  if (insights.length === 0) {
    return <p className="text-sm text-muted-foreground">Not enough data yet for insights.</p>
  }

  return (
    <ul className="flex flex-col gap-3">
      {insights.map((insight) => (
        <li key={insight.id} className="flex items-start gap-3">
          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15">
            <Lightbulb className="size-3.5 text-primary" aria-hidden="true" />
          </span>
          <p className="flex-1 text-sm text-foreground">{insight.text}</p>
          {insight.to && (
            <Link
              to={insight.to}
              className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          )}
        </li>
      ))}
    </ul>
  )
}

export function KeyInsightsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-4/5" />
      <Skeleton className="h-5 w-3/5" />
    </div>
  )
}