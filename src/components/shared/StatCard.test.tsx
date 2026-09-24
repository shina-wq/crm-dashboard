import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { Users } from "lucide-react"
import { StatCard, StatCardSkeleton } from "./StatCard"

describe("StatCard", () => {
  it("renders the label and value", () => {
    render(<StatCard label="Total Customers" value="12,482" icon={Users} />)

    expect(screen.getByText("Total Customers")).toBeInTheDocument()
    expect(screen.getByText("12,482")).toBeInTheDocument()
  })

  it("hides the icon from assistive tech", () => {
    render(<StatCard label="Total Customers" value="12,482" icon={Users} />)
    expect(document.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
  })
})

describe("StatCardSkeleton", () => {
  it("renders no text content", () => {
    render(<StatCardSkeleton />)
    expect(screen.queryByText(/./)).not.toBeInTheDocument()
  })
})