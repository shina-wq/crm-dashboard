import { describe, expect, it } from "vitest"
import { makeCustomer, makeItem, makeProduct, makePurchase } from "@/test/factories"
import { verifyRelationships } from "./relationships"

const cleanReport = {
  orphanPurchases: [],
  orphanItems: [],
  duplicateIds: { customers: [], purchases: [], products: [] },
}

describe("verifyRelationships", () => {
  it("reports nothing when every reference resolves", () => {
    const report = verifyRelationships(
      [makeCustomer(1), makeCustomer(2)],
      [makePurchase(1, 1, 10), makePurchase(2, 2, 20)],
      [makeProduct(1)]
    )

    expect(report).toEqual(cleanReport)
  })

  it("reports nothing for empty inputs", () => {
    expect(verifyRelationships([], [], [])).toEqual(cleanReport)
  })

  it("finds purchases that point to a missing customer", () => {
    const report = verifyRelationships(
      [makeCustomer(1)],
      [makePurchase(1, 1, 10), makePurchase(2, 999, 20)],
      [makeProduct(1)]
    )

    expect(report.orphanPurchases).toEqual([2])
  })

  it("finds purchase items that point to a missing product", () => {
    const report = verifyRelationships(
      [makeCustomer(1)],
      [makePurchase(5, 1, 10, { items: [makeItem(1), makeItem(99)] })],
      [makeProduct(1)]
    )

    expect(report.orphanItems).toEqual([{ purchaseId: 5, productId: 99 }])
  })

  it("finds duplicate ids in each collection, once per id", () => {
    const report = verifyRelationships(
      [makeCustomer(1), makeCustomer(1), makeCustomer(2)],
      [makePurchase(3, 1, 10), makePurchase(3, 2, 10)],
      [makeProduct(4), makeProduct(4), makeProduct(4)]
    )

    expect(report.duplicateIds).toEqual({ customers: [1], purchases: [3], products: [4] })
  })
})