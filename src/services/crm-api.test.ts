import { afterEach, describe, expect, it, vi } from "vitest"
import { apiClient } from "./api-client"
import { getCustomers, getProducts, getPurchases } from "./crm-api"

const user = (id: number, overrides: Record<string, unknown> = {}) => ({
  id,
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  ...overrides,
})

const product = {
  id: 10,
  title: "Mascara",
  category: "beauty",
  price: 9.99,
  discountPercentage: 7.5,
  rating: 4.5,
  stock: 20,
}

const cart = {
  id: 4,
  userId: 1,
  total: 40,
  discountedTotal: 36,
  totalQuantity: 4,
  products: [
    { id: 10, title: "Mascara", price: 10, quantity: 4, total: 40, discountedTotal: 36 },
  ],
}

function mockGet(response: unknown) {
  return vi.spyOn(apiClient, "get").mockResolvedValue(response)
}

afterEach(() => vi.restoreAllMocks())

describe("getCustomers", () => {
  it("requests all users and returns mapped customers", async () => {
    const get = mockGet({ users: [user(1), user(2)] })
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})

    const customers = await getCustomers()

    expect(get).toHaveBeenCalledWith("/users?limit=0")
    expect(customers.map((c) => c.id)).toEqual([1, 2])
    expect(warn).not.toHaveBeenCalled()
  })

  it("returns valid records and warns when some are invalid", async () => {
    mockGet({ users: [user(1), user(2, { email: undefined })] })
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})

    const customers = await getCustomers()

    expect(customers.map((c) => c.id)).toEqual([1])
    expect(warn).toHaveBeenCalledWith("/users: skipped 1 invalid record(s)")
  })

  it("throws when the response envelope is broken", async () => {
    mockGet({ people: [] })
    await expect(getCustomers()).rejects.toThrow()
  })

  it("propagates request errors", async () => {
    vi.spyOn(apiClient, "get").mockRejectedValue(new Error("network down"))
    await expect(getCustomers()).rejects.toThrow("network down")
  })
})

describe("getPurchases", () => {
  it("requests all carts and returns mapped purchases", async () => {
    const get = mockGet({ carts: [cart] })

    const purchases = await getPurchases()

    expect(get).toHaveBeenCalledWith("/carts?limit=0")
    expect(purchases).toHaveLength(1)
    expect(purchases[0]).toMatchObject({ id: 4, customerId: 1, status: "completed" })
  })

  it("throws when the response envelope is broken", async () => {
    mockGet({ users: [] })
    await expect(getPurchases()).rejects.toThrow()
  })
})

describe("getProducts", () => {
  it("requests the full catalog and returns mapped products", async () => {
    const get = mockGet({ products: [product] })

    const products = await getProducts()

    expect(get).toHaveBeenCalledWith("/products?limit=0")
    expect(products[0]).toMatchObject({ id: 10, brand: "" })
  })

  it("throws when the response envelope is broken", async () => {
    mockGet({})
    await expect(getProducts()).rejects.toThrow()
  })
})