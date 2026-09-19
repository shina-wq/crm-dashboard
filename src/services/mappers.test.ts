import { describe, expect, it } from "vitest"
import { derivePurchaseStatus, mapCarts, mapProducts, mapUsers } from "./mappers"

const rawUser = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  phone: "+250 788 000 000",
  image: "https://example.com/ada.png",
  company: { name: "Analytical Engines", title: "Founder" },
  address: { country: "Rwanda", city: "Kigali", postalCode: "0000" },
  ssn: "000-00-0000",
  bank: { cardNumber: "0000" },
  ...overrides,
})

const rawProduct = (overrides: Record<string, unknown> = {}) => ({
  id: 10,
  title: "Mascara",
  description: "Long lasting",
  category: "beauty",
  price: 9.99,
  discountPercentage: 7.5,
  rating: 4.5,
  stock: 20,
  brand: "Essence",
  thumbnail: "https://example.com/m.png",
  ...overrides,
})

const rawItem = (overrides: Record<string, unknown> = {}) => ({
  id: 10,
  title: "Mascara",
  price: 10,
  quantity: 4,
  total: 40,
  discountedTotal: 36,
  discountPercentage: 10,
  thumbnail: "https://example.com/m.png",
  ...overrides,
})

const rawCart = (overrides: Record<string, unknown> = {}) => ({
  id: 4,
  userId: 1,
  total: 40,
  discountedTotal: 36,
  totalProducts: 1,
  totalQuantity: 4,
  products: [rawItem()],
  ...overrides,
})

describe("derivePurchaseStatus", () => {
  it.each([
    [10, "completed"],
    [6, "completed"],
    [7, "processing"],
    [8, "processing"],
    [9, "cancelled"],
    [19, "cancelled"],
    [20, "completed"],
  ] as const)("id %i -> %s", (id, expected) => {
    expect(derivePurchaseStatus(id)).toBe(expected)
  })

  it("returns the same status for the same id", () => {
    expect(derivePurchaseStatus(17)).toBe(derivePurchaseStatus(17))
  })
})

describe("mapUsers", () => {
  it("maps only the customer fields and drops everything else", () => {
    const { items, skipped } = mapUsers([rawUser()])

    expect(skipped).toBe(0)
    expect(items).toEqual([
      {
        id: 1,
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        phone: "+250 788 000 000",
        image: "https://example.com/ada.png",
        company: "Analytical Engines",
        country: "Rwanda",
        city: "Kigali",
      },
    ])
  })

  it("defaults missing optional text fields to empty strings", () => {
    const { items } = mapUsers([
      rawUser({ phone: undefined, image: undefined, company: undefined, address: undefined }),
    ])

    expect(items[0]).toMatchObject({ phone: "", image: "", company: "", country: "", city: "" })
  })

  it("skips records missing required fields and counts them", () => {
    const { items, skipped } = mapUsers([
      rawUser({ id: 1 }),
      rawUser({ id: 2, email: undefined }),
      rawUser({ id: "3" }),
      null,
      "not an object",
    ])

    expect(items.map((c) => c.id)).toEqual([1])
    expect(skipped).toBe(4)
  })

  it("returns an empty result for an empty list", () => {
    expect(mapUsers([])).toEqual({ items: [], skipped: 0 })
  })
})

describe("mapProducts", () => {
  it("maps a full product", () => {
    const { items } = mapProducts([rawProduct()])

    expect(items[0]).toEqual({
      id: 10,
      title: "Mascara",
      description: "Long lasting",
      category: "beauty",
      price: 9.99,
      discountPercentage: 7.5,
      rating: 4.5,
      stock: 20,
      brand: "Essence",
      thumbnail: "https://example.com/m.png",
    })
  })

  it("maps a missing brand to an empty string", () => {
    const { items } = mapProducts([rawProduct({ brand: undefined })])
    expect(items[0].brand).toBe("")
  })

  it("skips products with a missing or negative price", () => {
    const { items, skipped } = mapProducts([
      rawProduct({ id: 1 }),
      rawProduct({ id: 2, price: undefined }),
      rawProduct({ id: 3, price: -5 }),
    ])

    expect(items.map((p) => p.id)).toEqual([1])
    expect(skipped).toBe(2)
  })
})

describe("mapCarts", () => {
  it("maps a cart to a purchase with derived fields", () => {
    const { items, skipped } = mapCarts([rawCart()])

    expect(skipped).toBe(0)
    expect(items[0]).toEqual({
      id: 4,
      customerId: 1,
      total: 40,
      discountedTotal: 36,
      totalQuantity: 4,
      status: "completed",
      items: [
        {
          productId: 10,
          title: "Mascara",
          price: 10,
          quantity: 4,
          total: 40,
          discountedPrice: 9,
          discountedTotal: 36,
        },
      ],
    })
  })

  it("derives status from the cart id", () => {
    const { items } = mapCarts([rawCart({ id: 7 }), rawCart({ id: 9 })])
    expect(items.map((p) => p.status)).toEqual(["processing", "cancelled"])
  })

  it("keeps the item's own prices, never the catalog's", () => {
    const { items } = mapCarts([rawCart({ products: [rawItem({ price: 100, total: 400 })] })])
    expect(items[0].items[0].price).toBe(100)
  })

  it("skips a cart with no items", () => {
    const { items, skipped } = mapCarts([rawCart({ products: [] })])
    expect(items).toEqual([])
    expect(skipped).toBe(1)
  })

  it("skips the whole cart if one item is invalid", () => {
    const { items, skipped } = mapCarts([
      rawCart({ products: [rawItem(), rawItem({ id: 11, quantity: 0 })] }),
      rawCart({ id: 5, products: [rawItem({ discountedTotal: undefined })] }),
      rawCart({ id: 6 }),
    ])

    expect(items.map((p) => p.id)).toEqual([6])
    expect(skipped).toBe(2)
  })
})