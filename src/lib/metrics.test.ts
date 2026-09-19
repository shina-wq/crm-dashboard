import { describe, expect, it } from "vitest"
import { makeCustomer, makeItem, makePurchase } from "@/test/factories"
import { computeDashboardMetrics, computeTopProducts } from "./metrics"

describe("computeDashboardMetrics", () => {
  it("returns zeros for empty data, with no NaN", () => {
    expect(computeDashboardMetrics([], [])).toEqual({
      totalCustomers: 0,
      totalPurchases: 0,
      averageOrderValue: 0,
      statusBreakdown: { completed: 0, processing: 0, cancelled: 0 },
    })
  })

  it("counts customers and purchases", () => {
    const metrics = computeDashboardMetrics(
      [makeCustomer(1), makeCustomer(2), makeCustomer(3)],
      [makePurchase(1, 1, 10), makePurchase(2, 2, 20)]
    )

    expect(metrics.totalCustomers).toBe(3)
    expect(metrics.totalPurchases).toBe(2)
  })

  it("averages the original purchase totals, not the discounted ones", () => {
    const metrics = computeDashboardMetrics(
      [],
      [
        makePurchase(1, 1, 100, { discountedTotal: 1 }),
        makePurchase(2, 2, 200, { discountedTotal: 1 }),
      ]
    )

    expect(metrics.averageOrderValue).toBe(150)
  })

  it("counts purchases by status and keeps empty statuses at zero", () => {
    const metrics = computeDashboardMetrics(
      [],
      [
        makePurchase(1, 1, 10, { status: "completed" }),
        makePurchase(2, 2, 10, { status: "completed" }),
        makePurchase(3, 3, 10, { status: "cancelled" }),
      ]
    )

    expect(metrics.statusBreakdown).toEqual({ completed: 2, processing: 0, cancelled: 1 })
  })
})

describe("computeTopProducts", () => {
  it("returns an empty list when there are no purchases", () => {
    expect(computeTopProducts([])).toEqual([])
  })

  it("sums quantity across items and purchases", () => {
    const top = computeTopProducts([
      makePurchase(1, 1, 0, { items: [makeItem(1, { quantity: 2 }), makeItem(2, { quantity: 1 })] }),
      makePurchase(2, 2, 0, { items: [makeItem(1, { quantity: 3 })] }),
    ])

    expect(top.map(({ productId, quantity }) => ({ productId, quantity }))).toEqual([
      { productId: 1, quantity: 5 },
      { productId: 2, quantity: 1 },
    ])
  })

  it("ranks by quantity, breaking ties by product id", () => {
    const top = computeTopProducts([
      makePurchase(1, 1, 0, {
        items: [makeItem(7, { quantity: 2 }), makeItem(3, { quantity: 2 }), makeItem(5, { quantity: 9 })],
      }),
    ])

    expect(top.map((p) => p.productId)).toEqual([5, 3, 7])
  })

  it("limits the result, defaulting to 5", () => {
    const items = [1, 2, 3, 4, 5, 6, 7].map((id) => makeItem(id))
    const purchases = [makePurchase(1, 1, 0, { items })]

    expect(computeTopProducts(purchases)).toHaveLength(5)
    expect(computeTopProducts(purchases, 2).map((p) => p.productId)).toEqual([1, 2])
  })
})