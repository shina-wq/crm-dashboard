import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MemoryRouter } from "react-router-dom"
import { AuthProvider } from "@/features/auth/AuthProvider"
import { writeSession } from "@/features/auth/session"
import { getCustomers, getPurchases } from "@/services/crm-api"
import { makeAuthUser, makeCustomer, makePurchase } from "@/test/factories"
import { DashboardPage } from "./DashboardPage"

vi.mock("@/services/crm-api")

function renderDashboard() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  writeSession(makeAuthUser({ firstName: "Emily" }))

  return render(
    <QueryClientProvider client={client}>
      <AuthProvider>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

beforeEach(() => localStorage.clear())

describe("DashboardPage", () => {
  it("greets the signed-in user", () => {
    vi.mocked(getCustomers).mockResolvedValue([])
    vi.mocked(getPurchases).mockResolvedValue([])
    renderDashboard()

    expect(screen.getByText(/Emily/)).toBeInTheDocument()
  })

  it("shows skeletons while loading, no KPI labels yet", () => {
    vi.mocked(getCustomers).mockReturnValue(new Promise(() => {}))
    vi.mocked(getPurchases).mockReturnValue(new Promise(() => {}))
    renderDashboard()

    expect(screen.queryByText("Total Customers")).not.toBeInTheDocument()
  })

  it("renders KPI values once data loads", async () => {
    vi.mocked(getCustomers).mockResolvedValue([makeCustomer(1), makeCustomer(2)])
    vi.mocked(getPurchases).mockResolvedValue([makePurchase(1, 1, 100)])
    renderDashboard()

    expect(await screen.findByText("Total Customers")).toBeInTheDocument()
    expect(screen.getByText("2")).toBeInTheDocument()
    expect(screen.getByText("1")).toBeInTheDocument()
  })

  it("shows an error state when a query fails", async () => {
    vi.mocked(getCustomers).mockRejectedValue(new Error("down"))
    vi.mocked(getPurchases).mockResolvedValue([])
    renderDashboard()

    expect(await screen.findByText("Couldn't load dashboard metrics")).toBeInTheDocument()
  })
})