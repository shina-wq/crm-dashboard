import type { DashboardMetrics, TopProduct } from "@/lib/metrics"
import type { CustomerMetrics } from "@/types/customer"

export type Insight = { id: string; text: string; to?: string }

export function computeKeyInsights(
  metrics: DashboardMetrics,
  segments: CustomerMetrics[],
  topProducts: TopProduct[]
): Insight[] {
  const insights: Insight[] = []
  const totalCustomers = segments.length

  if (totalCustomers > 0) {
    const highValue = segments.filter((s) => s.segment === "high-value").length
    if (highValue > 0) {
      const pct = Math.round((highValue / totalCustomers) * 100)
      insights.push({
        id: "high-value",
        text:
          highValue === 1
            ? `1 customer (${pct}%) is a High Value spender.`
            : `${highValue} customers (${pct}%) are High Value spenders.`,
        to: "/segments",
      })
    }

    const noPurchase = segments.filter((s) => s.segment === "no-purchase").length
    if (noPurchase > 0) {
      const pct = Math.round((noPurchase / totalCustomers) * 100)
      insights.push({
        id: "no-purchase",
        text:
          noPurchase === 1
            ? `1 customer has never made a purchase.`
            : `${noPurchase} customers (${pct}%) have never made a purchase.`,
        to: "/segments",
      })
    }
  }

  if (metrics.totalPurchases > 0 && metrics.statusBreakdown.cancelled > 0) {
    const pct = Math.round((metrics.statusBreakdown.cancelled / metrics.totalPurchases) * 100)
    insights.push({ id: "cancelled-rate", text: `${pct}% of purchases were cancelled.` })
  }

  const topProduct = topProducts[0]
  if (topProduct) {
    insights.push({
      id: "top-product",
      text: `${topProduct.title} is the best-selling product with ${topProduct.quantity} units sold.`,
      to: "/products",
    })
  }

  return insights.slice(0, 3)
}