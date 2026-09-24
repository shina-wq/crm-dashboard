import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import type { PurchaseStatus } from "@/types/purchase"

const STATUS_META: Record<PurchaseStatus, { label: string; color: string }> = {
  completed: { label: "Completed", color: "var(--success-foreground)" },
  processing: { label: "Processing", color: "var(--warning-foreground)" },
  cancelled: { label: "Cancelled", color: "var(--danger-foreground)" },
}

type PurchaseStatusBreakdownProps = {
  statusBreakdown: Record<PurchaseStatus, number>
}

export function PurchaseStatusBreakdown({ statusBreakdown }: PurchaseStatusBreakdownProps) {
  const total = Object.values(statusBreakdown).reduce((sum, n) => sum + n, 0)

  const data = (Object.keys(statusBreakdown) as PurchaseStatus[]).map((status) => ({
    status,
    label: STATUS_META[status].label,
    count: statusBreakdown[status],
    color: STATUS_META[status].color,
  }))

  if (total === 0) {
    return <p className="text-sm text-muted-foreground">No purchases yet.</p>
  }

  return (
    <div>
      <p className="sr-only">
        Purchase status breakdown, {total} total purchases:{" "}
        {data.map((d) => `${d.label} ${d.count} (${Math.round((d.count / total) * 100)}%)`).join(", ")}.
      </p>

      <div aria-hidden="true" className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="label"
              width={90}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 13 }}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)" }}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                fontSize: 13,
              }}
              formatter={(value) => {
                const count = Number(value)
                return [`${count} ($Math.round((count / total) * 100)}%)`, "Purchases"]
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={28}>
              {data.map((d) => (
                <Cell key={d.status} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function PurchaseStatusBreakdownSkeleton() {
  return <Skeleton className="h-48 w-full" />
}