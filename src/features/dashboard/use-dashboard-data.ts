import { useQueries } from "@tanstack/react-query"
import { useMemo } from "react"
import { computeCustomerMetrics } from "@/lib/segmentation"
import { computeDashboardMetrics, computeTopProducts } from "@/lib/metrics"
import { getCustomers, getPurchases } from "@/services/crm-api"

export function useDashboardData() {
  const [customersQuery, purchasesQuery] = useQueries({
    queries: [
      { queryKey: ["customers"], queryFn: getCustomers },
      { queryKey: ["purchases"], queryFn: getPurchases },
    ],
  })

  const customers = customersQuery.data
  const purchases = purchasesQuery.data

  const derived = useMemo(() => {
    if (!customers || !purchases) return undefined
    return {
      metrics: computeDashboardMetrics(customers, purchases),
      segments: computeCustomerMetrics(customers, purchases),
      topProducts: computeTopProducts(purchases),
    }
  }, [customers, purchases])

  return {
    customers,
    purchases,
    ...derived,
    isLoading: customersQuery.isLoading || purchasesQuery.isLoading,
    customersError: customersQuery.isError,
    purchasesError: purchasesQuery.isError,
    isError: customersQuery.isError && purchasesQuery.isError,
    refetch: () => {
      customersQuery.refetch()
      purchasesQuery.refetch()
    },
  }
}