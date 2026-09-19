import { describe, expect, it } from "vitest"
import { makeCustomer, makePurchase } from "@/test/factories"
import { computeCustomerMetrics, percentile } from "./segmentation"

// One customer and one purchase per total: customer i+1 spends totals[i].
const oneEach = (totals: number[]) => ({
  customers: totals.map((_, i) => makeCustomer(i + 1)),
  purchases: totals.map((total, i) => makePurchase(i + 1, i + 1, total)),
})

const segmentsFor = (totals: number[]) => {
  const { customers, purchases } = oneEach(totals)
  return computeCustomerMetrics(customers, purchases).map((m) => m.segment)
}

describe("percentile", () => {
  it("returns Infinity for an empty list", () => {
    expect(percentile([], 0.5)).toBe(Infinity)
  })

  it("returns the only value for a single-item list", () => {
    expect(percentile([7], 0.25)).toBe(7)
    expect(percentile([7], 0.75)).toBe(7)
  })

  it("returns exact values when the rank lands on an index", () => {
    expect(percentile([10, 20, 30], 0)).toBe(10)
    expect(percentile([10, 20, 30], 0.5)).toBe(20)
    expect(percentile([10, 20, 30], 1)).toBe(30)
  })

  it("interpolates between values", () => {
    const values = [10, 20, 30, 40]
    expect(percentile(values, 0.25)).toBe(17.5)
    expect(percentile(values, 0.5)).toBe(25)
    expect(percentile(values, 0.75)).toBe(32.5)
  })
})

describe("computeCustomerMetrics", () => {
  it("returns an empty list for no customers", () => {
    expect(computeCustomerMetrics([], [])).toEqual([])
  })

  it("computes count, total and average per customer", () => {
    const metrics = computeCustomerMetrics(
      [makeCustomer(1), makeCustomer(2)],
      [makePurchase(1, 1, 10), makePurchase(2, 1, 30)]
    )

    expect(metrics[0]).toMatchObject({
      customerId: 1,
      purchaseCount: 2,
      totalSpending: 40,
      averagePurchaseValue: 20,
    })
    expect(metrics[1]).toMatchObject({
      customerId: 2,
      purchaseCount: 0,
      totalSpending: 0,
      averagePurchaseValue: 0,
      segment: "no-purchase",
    })
  })

  it("keeps the input customer order", () => {
    const { customers, purchases } = oneEach([30, 10, 20])
    const ids = computeCustomerMetrics(customers, purchases).map((m) => m.customerId)
    expect(ids).toEqual([1, 2, 3])
  })

  it("splits purchasers into quartile tiers", () => {
    expect(segmentsFor([10, 20, 30, 40])).toEqual([
      "low-value",
      "mid-value",
      "mid-value",
      "high-value",
    ])
  })

  it("puts ties at the high threshold in High Value and ties at the low threshold in Mid Value", () => {
    // thresholds: p25 = 20, p75 = 40
    expect(segmentsFor([10, 20, 30, 40, 50])).toEqual([
      "low-value",
      "mid-value",
      "mid-value",
      "high-value",
      "high-value",
    ])
  })

  it("sums multiple purchases per customer before tiering", () => {
    const customers = [1, 2, 3, 4].map((id) => makeCustomer(id))
    const purchases = [
      makePurchase(1, 1, 20),
      makePurchase(2, 1, 20), // customer 1 total: 40
      makePurchase(3, 2, 20),
      makePurchase(4, 3, 30),
      makePurchase(5, 4, 10),
    ]

    const segments = computeCustomerMetrics(customers, purchases).map((m) => m.segment)
    expect(segments).toEqual(["high-value", "mid-value", "mid-value", "low-value"])
  })

  it("does not depend on purchase order", () => {
    const { customers, purchases } = oneEach([10, 20, 30, 40])
    const forward = computeCustomerMetrics(customers, purchases)
    const reversed = computeCustomerMetrics(customers, [...purchases].reverse())
    expect(reversed).toEqual(forward)
  })

  it("makes a lone purchaser High Value", () => {
    const metrics = computeCustomerMetrics(
      [makeCustomer(1), makeCustomer(2), makeCustomer(3)],
      [makePurchase(1, 2, 50)]
    )

    expect(metrics.map((m) => m.segment)).toEqual(["no-purchase", "high-value", "no-purchase"])
  })

  it("makes everyone High Value when all purchasers spend the same", () => {
    expect(segmentsFor([20, 20, 20])).toEqual(["high-value", "high-value", "high-value"])
  })

  it("marks everyone No Purchase when there are no purchases", () => {
    const metrics = computeCustomerMetrics([makeCustomer(1), makeCustomer(2)], [])
    expect(metrics.map((m) => m.segment)).toEqual(["no-purchase", "no-purchase"])
  })

  it("does not let non-purchasers shift the thresholds", () => {
    const { customers, purchases } = oneEach([10, 20, 30, 40])
    const withExtras = computeCustomerMetrics(
      [...customers, makeCustomer(5), makeCustomer(6)],
      purchases
    )

    expect(withExtras.map((m) => m.segment)).toEqual([
      "low-value",
      "mid-value",
      "mid-value",
      "high-value",
      "no-purchase",
      "no-purchase",
    ])
  })

  it("ignores purchases that belong to no customer", () => {
    const { customers, purchases } = oneEach([10, 20, 30, 40])
    const withOrphan = computeCustomerMetrics(customers, [
      ...purchases,
      makePurchase(99, 999, 1000),
    ])

    expect(withOrphan).toEqual(computeCustomerMetrics(customers, purchases))
  })
})