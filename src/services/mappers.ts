import type { ZodType } from "zod"
import {
  dummyJsonCartSchema,
  dummyJsonProductSchema,
  dummyJsonUserSchema,
  type DummyJsonCart,
  type DummyJsonProduct,
  type DummyJsonUser,
} from "@/types/dummyjson"
import type { Customer } from "@/types/customer"
import type { Product } from "@/types/product"
import type { Purchase, PurchaseStatus } from "@/types/purchase"

export type MapResult<T> = { items: T[]; skipped: number }

// Validates each record on its own. Invalid records are skipped and counted, never patched.
function mapRecords<TRaw, T>(
  records: unknown[],
  schema: ZodType<TRaw>,
  map: (raw: TRaw) => T
): MapResult<T> {
  const items: T[] = []
  let skipped = 0

  for (const record of records) {
    const parsed = schema.safeParse(record)
    if (parsed.success) items.push(map(parsed.data))
    else skipped++
  }

  return { items, skipped }
}

// id % 10: 0-6 completed, 7-8 processing, 9 cancelled. Demo value, deterministic.
export function derivePurchaseStatus(id: number): PurchaseStatus {
  const bucket = id % 10
  if (bucket <= 6) return "completed"
  if (bucket <= 8) return "processing"
  return "cancelled"
}

function toCustomer(raw: DummyJsonUser): Customer {
  return {
    id: raw.id,
    firstName: raw.firstName,
    lastName: raw.lastName,
    email: raw.email,
    phone: raw.phone ?? "",
    image: raw.image ?? "",
    company: raw.company?.name ?? "",
    country: raw.address?.country ?? "",
    city: raw.address?.city ?? "",
  }
}

function toProduct(raw: DummyJsonProduct): Product {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description ?? "",
    category: raw.category,
    price: raw.price,
    discountPercentage: raw.discountPercentage,
    rating: raw.rating,
    stock: raw.stock,
    brand: raw.brand ?? "",
    thumbnail: raw.thumbnail ?? "",
  }
}

function toPurchase(raw: DummyJsonCart): Purchase {
  return {
    id: raw.id,
    customerId: raw.userId,
    total: raw.total,
    discountedTotal: raw.discountedTotal,
    totalQuantity: raw.totalQuantity,
    status: derivePurchaseStatus(raw.id),
    items: raw.products.map((item) => ({
      productId: item.id,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      total: item.total,
      discountedPrice: item.discountedTotal / item.quantity,
      discountedTotal: item.discountedTotal,
    })),
  }
}

export const mapUsers = (records: unknown[]) =>
  mapRecords(records, dummyJsonUserSchema, toCustomer)

export const mapProducts = (records: unknown[]) =>
  mapRecords(records, dummyJsonProductSchema, toProduct)

export const mapCarts = (records: unknown[]) =>
  mapRecords(records, dummyJsonCartSchema, toPurchase)