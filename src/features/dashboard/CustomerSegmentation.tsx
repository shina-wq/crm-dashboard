import { useMemo } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import type { CustomerMetrics, CustomerSegment } from "@/types/customer"

const SEGMENT_META: Record<CustomerSegment, { label: string; color: string }> = {
  "high-value": { label: "High Value", color: "var(--segment-high-value-foreground)" },
  "mid-value": { label: "Mid Value", color: "var(--segment-mid-value-foreground)" },
  "low-value": { label: "Low Value", color: "var(--segment-low-value-foreground)" },
  "no-purchase": { label: "No Purchase", color: "var(--segment-no-purchase-foreground)" },
}

const SEGMENT_ORDER: CustomerSegment[] = ["high-value", "mid-value", "low-value", "no-purchase"]

type CustomerSegmentationProps = {
  segments: CustomerMetrics[]
}

export function CustomerSegmentation({ segments }: CustomerSegmentationProps) {
  const data = useMemo(() => {
    const counts = SEGMENT_ORDER.reduce(
      (acc, segment) => ({ ...acc, [segment]: 0 }),
      {} as Record<CustomerSegment, number>
    )
    for (const { segment } of segments) counts[segment] += 1

    return SEGMENT_ORDER.map((segment) => ({
      segment,
      label: SEGMENT_META[segment].label,
      color: SEGMENT_META[segment].color,
      count: counts[segment],
    }))
  }, [segments])

  const total = segments.length

  if (total === 0) {
    return <p className="text-sm text-muted-foreground">No customers yet.</p>
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <p className="sr-only">
        Customer segments, {total} total customers:{" "}
        {data.map((d) => `${d.label} ${d.count} (${Math.round((d.count / total) * 100)}%)`).join(", ")}.
      </p>

      <div aria-hidden="true" className="h-40 w-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="label" innerRadius="65%" outerRadius="100%" paddingAngle={2}>
              {data.map((d) => (
                <Cell key={d.segment} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                fontSize: 13,
              }}
              formatter={(value) => {
                const count = Number(value)
                return [`${count} (${Math.round((count / total) * 100)}%)`, "Customers"]
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul aria-hidden="true" className="flex flex-1 flex-col gap-2">
        {data.map((d) => (
          <li key={d.segment} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-foreground">
              <span className="size-2 rounded-full" style={{ backgroundColor: d.color }} />
              {d.label}
            </span>
            <span className="tabular-nums text-muted-foreground">{d.count}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function CustomerSegmentationSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="size-40 shrink-0 rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
      </div>
    </div>
  )
}