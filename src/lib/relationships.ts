import type { Customer } from "@/types/customer"
import type { Product } from "@/types/product"
import type { Purchase } from "@/types/purchase"

export type RelationshipReport = {
  /** Purchase ids whose customerId matches no customer. */
  orphanPurchases: number[]
  /** Purchase items whose productId matches no product. */
  orphanItems: { purchaseId: number; productId: number }[]
  /** Ids that appear more than once. Joins by id are unsafe when this is not empty. */
  duplicateIds: { customers: number[]; purchases: number[]; products: number[] }
}

function findDuplicates(ids: number[]): number[] {
  const seen = new Set<number>()
  const duplicates = new Set<number>()

  for (const id of ids) {
    if (seen.has(id)) duplicates.add(id)
    seen.add(id)
  }

  return [...duplicates]
}

export function verifyRelationships(
  customers: Customer[],
  purchases: Purchase[],
  products: Product[]
): RelationshipReport {
  const customerIds = new Set(customers.map((c) => c.id))
  const productIds = new Set(products.map((p) => p.id))

  return {
    orphanPurchases: purchases.filter((p) => !customerIds.has(p.customerId)).map((p) => p.id),
    orphanItems: purchases.flatMap((purchase) =>
      purchase.items
        .filter((item) => !productIds.has(item.productId))
        .map((item) => ({ purchaseId: purchase.id, productId: item.productId }))
    ),
    duplicateIds: {
      customers: findDuplicates(customers.map((c) => c.id)),
      purchases: findDuplicates(purchases.map((p) => p.id)),
      products: findDuplicates(products.map((p) => p.id)),
    },
  }
}