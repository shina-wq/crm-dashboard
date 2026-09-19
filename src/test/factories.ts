import type { Customer } from "@/types/customer"
import type { Product } from "@/types/product"
import type { Purchase, PurchaseItem } from "@/types/purchase"

export const makeCustomer = (id: number, overrides: Partial<Customer> = {}): Customer => ({
  id,
  firstName: "Ada",
  lastName: "Lovelace",
  email: `c${id}@example.com`,
  phone: "",
  image: "",
  company: "",
  country: "",
  city: "",
  ...overrides,
})

export const makeProduct = (id: number, overrides: Partial<Product> = {}): Product => ({
  id,
  title: `Product ${id}`,
  description: "",
  category: "beauty",
  price: 10,
  discountPercentage: 0,
  rating: 4,
  stock: 5,
  brand: "",
  thumbnail: "",
  ...overrides,
})

export const makeItem = (productId: number, overrides: Partial<PurchaseItem> = {}): PurchaseItem => ({
  productId,
  title: `Product ${productId}`,
  price: 10,
  quantity: 1,
  total: 10,
  discountedPrice: 10,
  discountedTotal: 10,
  ...overrides,
})

export const makePurchase = (
  id: number,
  customerId: number,
  total: number,
  overrides: Partial<Purchase> = {}
): Purchase => ({
  id,
  customerId,
  total,
  discountedTotal: total,
  totalQuantity: 1,
  status: "completed",
  items: [makeItem(1)],
  ...overrides,
})