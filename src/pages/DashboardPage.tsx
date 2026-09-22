import { useEffect } from "react"
import { getCustomers, getProducts, getPurchases } from "@/services/crm-api"
import { computeCustomerMetrics } from "@/lib/segmentation"
import { computeDashboardMetrics, computeTopProducts } from "@/lib/metrics"
import { verifyRelationships } from "@/lib/relationships"
import { PageHeader } from "@/components/shared/PageHeader"
import { useAuth } from "@/features/auth/auth-context"

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 5) return "Good night"
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  if (hour < 21) return "Good evening"
  return "Good night"
}

export function DashboardPage() {
  const { user } = useAuth()

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

  return (
    <PageHeader
      title={`${getGreeting()}, ${user?.firstName ?? ""}`}
      subtitle="Here's what's happening with your customers today."
    />
  )
}