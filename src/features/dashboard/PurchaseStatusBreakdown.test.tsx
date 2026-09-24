import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { PurchaseStatusBreakdown } from "./PurchaseStatusBreakdown"

describe("PurchaseStatusBreakdown", () => {
  it("exposes an accessible text summary of the counts and percentages", () => {
    render(
      <PurchaseStatusBreakdown statusBreakdown={{ completed: 6, processing: 2, cancelled: 2 }} />
    )

    const summary = screen.getByText(/10 total purchases/)
    expect(summary).toHaveTextContent("Completed 6 (60%)")
    expect(summary).toHaveTextContent("Processing 2 (20%)")
    expect(summary).toHaveTextContent("Cancelled 2 (20%)")
  })

  it("shows an empty message when there are no purchases", () => {
    render(<PurchaseStatusBreakdown statusBreakdown={{ completed: 0, processing: 0, cancelled: 0 }} />)
    expect(screen.getByText("No purchases yet.")).toBeInTheDocument()
  })
})