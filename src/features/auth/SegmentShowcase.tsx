const BADGE = "inline-flex h-5 items-center rounded-full px-2.5 text-xs font-medium"

const SEGMENTS = [
  {
    label: "High Value",
    description: "Top quarter by spend",
    badge: `${BADGE} bg-segment-high-value text-segment-high-value-foreground`,
  },
  {
    label: "Mid Value",
    description: "Middle half by spend",
    badge: `${BADGE} bg-segment-mid-value text-segment-mid-value-foreground`,
  },
  {
    label: "Low Value",
    description: "Bottom quarter by spend",
    badge: `${BADGE} bg-segment-low-value text-segment-low-value-foreground`,
  },
  {
    label: "No Purchase",
    description: "No purchases yet",
    badge: `${BADGE} bg-segment-no-purchase text-segment-no-purchase-foreground`,
  },
]

export function SegmentShowcase() {
  return (
    <div className="w-full max-w-md">
      <h2 className="text-2xl font-medium leading-tight text-foreground">
        Know your customers by what they spend
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Segments, purchase history, and top products in one place.
      </p>

      <ul className="mt-6 divide-y divide-border rounded-xl border border-border bg-card px-4">
        {SEGMENTS.map(({ label, description, badge }) => (
          <li key={label} className="flex items-center justify-between gap-4 py-3">
            <span className={badge}>{label}</span>
            <span className="text-sm text-muted-foreground">{description}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}