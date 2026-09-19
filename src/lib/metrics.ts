import type { Customer } from "@/types/customer"
import type { Purchase, PurchaseStatus } from "@/types/purchase"

export type DashboardMetrics = {
  totalCustomers: number
  totalPurchases: number
  averageOrderValue: number
  statusBreakdown: Record<PurchaseStatus, number>
}

export type TopProduct = {
  productId: number
  /** Title from the purchase snapshot. Use the catalog for current product info. */
  title: string
  quantity: number
}

export function computeDashboardMetrics(
  customers: Customer[],
  purchases: Purchase[]
): DashboardMetrics {
  const statusBreakdown: Record<PurchaseStatus, number> = {
    completed: 0,
    processing: 0,
    cancelled: 0,
  }
  let revenue = 0

  for (const purchase of purchases) {
    statusBreakdown[purchase.status] += 1
    revenue += purchase.total
  }

  return {
    totalCustomers: customers.length,
    totalPurchases: purchases.length,
    averageOrderValue: purchases.length > 0 ? revenue / purchases.length : 0,
    statusBreakdown,
  }
}

// Ranked by total quantity purchased. Ties break by product id so the order is stable.
export function computeTopProducts(purchases: Purchase[], limit = 5): TopProduct[] {
  const byProduct = new Map<number, TopProduct>()

  for (const { items } of purchases) {
    for (const item of items) {
      const entry = byProduct.get(item.productId) ?? {
        productId: item.productId,
        title: item.title,
        quantity: 0,
      }
      entry.quantity += item.quantity
      byProduct.set(item.productId, entry)
    }
  }

  return [...byProduct.values()]
    .sort((a, b) => b.quantity - a.quantity || a.productId - b.productId)
    .slice(0, limit)
}