import { useEffect } from "react"
import { getCustomers, getProducts, getPurchases } from "@/services/crm-api"
import { computeCustomerMetrics } from "@/lib/segmentation"
import { computeDashboardMetrics, computeTopProducts } from "@/lib/metrics"
import { verifyRelationships } from "@/lib/relationships"

export function DashboardPage() {
  useEffect(() => {
    Promise.all([getCustomers(), getPurchases(), getProducts()]).then(([c, p, pr]) => {
      console.log("relationships", verifyRelationships(c, p, pr))

      const segments: Record<string, number> = {}
      for (const m of computeCustomerMetrics(c, p)) {
        segments[m.segment] = (segments[m.segment] ?? 0) + 1
      }
      console.log("segments", segments)

      console.log("metrics", computeDashboardMetrics(c, p))
      console.log("top products", computeTopProducts(p))
    })
  }, [])

  return <h1 className="text-lg font-medium text-foreground">Dashboard</h1>
}