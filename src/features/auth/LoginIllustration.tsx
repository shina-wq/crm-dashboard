export function LoginIllustration() {
  return (
    <div className="w-full max-w-md">
      <h2 className="text-4xl font-semibold leading-[1.2] tracking-tight text-foreground">
        Know your customers by{" "}
        <span className="text-primary">
          what they spend
        </span>
      </h2>

      <p className="mt-3 text-base text-muted-foreground">
        Segments, purchase history, and top products in one place.
      </p>

      <svg
        viewBox="0 0 400 320"
        className="w-full drop-shadow-xl"
        role="img"
        aria-label="Abstract dashboard with a bar chart and a donut chart"
      >
        {/* Card */}
        <rect x="30" y="30" width="340" height="260" rx="20" className="fill-card stroke-border" />

        {/* Header lines */}
        <rect x="56" y="56" width="100" height="10" rx="5" className="fill-foreground/80" />
        <rect x="56" y="76" width="150" height="8" rx="4" className="fill-muted" />

        {/* Bars */}
        <rect x="60" y="200" width="30" height="60" rx="6" className="fill-chart-4" />
        <rect x="104" y="170" width="30" height="90" rx="6" className="fill-chart-3" />
        <rect x="148" y="185" width="30" height="75" rx="6" className="fill-chart-2" />
        <rect x="192" y="140" width="30" height="120" rx="6" className="fill-chart-1" />

        {/* Donut */}
        <g transform="translate(298 170) rotate(-90)" fill="none" strokeWidth="16">
          <circle r="38" className="stroke-muted" />
          <circle r="38" className="stroke-chart-1" strokeDasharray="120 239" strokeLinecap="round" />
          <circle r="38" className="stroke-chart-2" strokeDasharray="50 239" strokeDashoffset="-130" strokeLinecap="round" />
        </g>

        {/* Floating customer dots */}
        <circle cx="360" cy="52" r="14" className="fill-chart-2" />
        <circle cx="40" cy="270" r="10" className="fill-chart-5" />
      </svg>
    </div>
  )
}