import type { Customer, CustomerMetrics, CustomerSegment } from "@/types/customer"
import type { Purchase } from "@/types/purchase"

const HIGH_VALUE_PERCENTILE = 0.75
const LOW_VALUE_PERCENTILE = 0.25

// Linear interpolation (Excel PERCENTILE.INC / numpy default). Input must be sorted ascending.
export function percentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) return Infinity
  if (sortedValues.length === 1) return sortedValues[0]

  const rank = p * (sortedValues.length - 1)
  const lower = Math.floor(rank)
  const upper = Math.ceil(rank)
  if (lower === upper) return sortedValues[lower]

  return sortedValues[lower] + (rank - lower) * (sortedValues[upper] - sortedValues[lower])
}

function classify(
  purchaseCount: number,
  totalSpending: number,
  highThreshold: number,
  lowThreshold: number
): CustomerSegment {
  if (purchaseCount === 0) return "no-purchase"
  if (totalSpending >= highThreshold) return "high-value"
  if (totalSpending < lowThreshold) return "low-value"
  return "mid-value"
}

// Thresholds depend on the whole dataset, so this always needs every customer and purchase.
export function computeCustomerMetrics(
  customers: Customer[],
  purchases: Purchase[]
): CustomerMetrics[] {
  const byCustomer = new Map<number, { count: number; spending: number }>()

  for (const { customerId, total } of purchases) {
    const entry = byCustomer.get(customerId) ?? { count: 0, spending: 0 }
    entry.count += 1
    entry.spending += total
    byCustomer.set(customerId, entry)
  }

  const rows = customers.map((customer) => {
    const { count, spending } = byCustomer.get(customer.id) ?? { count: 0, spending: 0 }
    return { customerId: customer.id, purchaseCount: count, totalSpending: spending }
  })

  const spendValues = rows
    .filter((row) => row.purchaseCount >= 1)
    .map((row) => row.totalSpending)
    .sort((a, b) => a - b)

  const highThreshold = percentile(spendValues, HIGH_VALUE_PERCENTILE)
  const lowThreshold = percentile(spendValues, LOW_VALUE_PERCENTILE)

  return rows.map((row) => ({
    ...row,
    averagePurchaseValue: row.purchaseCount > 0 ? row.totalSpending / row.purchaseCount : 0,
    segment: classify(row.purchaseCount, row.totalSpending, highThreshold, lowThreshold),
  }))
}