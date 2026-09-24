import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import { getCustomers, getPurchases } from "@/services/crm-api"
import { makeCustomer, makePurchase } from "@/test/factories"
import { useDashboardData } from "./use-dashboard-data"

vi.mock("@/services/crm-api")

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe("useDashboardData", () => {
  it("returns derived metrics once both queries resolve", async () => {
    vi.mocked(getCustomers).mockResolvedValue([makeCustomer(1), makeCustomer(2)])
    vi.mocked(getPurchases).mockResolvedValue([makePurchase(1, 1, 50)])

    const { result } = renderHook(() => useDashboardData(), { wrapper })
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.metrics?.totalCustomers).toBe(2)
    expect(result.current.metrics?.totalPurchases).toBe(1)
    expect(result.current.segments).toHaveLength(2)
    expect(result.current.isError).toBe(false)
  })

  it("reports an error when a request fails", async () => {
    vi.mocked(getCustomers).mockResolvedValue([makeCustomer(1)])
    vi.mocked(getPurchases).mockRejectedValue(new Error("network down"))

    const { result } = renderHook(() => useDashboardData(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})