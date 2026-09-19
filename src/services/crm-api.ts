import { apiClient } from "./api-client"
import { mapCarts, mapProducts, mapUsers, type MapResult } from "./mappers"
import {
  cartsResponseSchema,
  productsResponseSchema,
  usersResponseSchema,
} from "@/types/dummyjson"
import type { Customer } from "@/types/customer"
import type { Product } from "@/types/product"
import type { Purchase } from "@/types/purchase"

function unwrap<T>(path: string, { items, skipped }: MapResult<T>): T[] {
  if (skipped > 0) console.warn(`${path}: skipped ${skipped} invalid record(s)`)
  return items
}

// A broken envelope (e.g. `users` missing) throws a ZodError, so TanStack Query shows an error state.
export async function getCustomers(): Promise<Customer[]> {
  const raw = await apiClient.get<unknown>("/users?limit=0")
  return unwrap("/users", mapUsers(usersResponseSchema.parse(raw).users))
}

export async function getPurchases(): Promise<Purchase[]> {
  const raw = await apiClient.get<unknown>("/carts?limit=0")
  return unwrap("/carts", mapCarts(cartsResponseSchema.parse(raw).carts))
}

export async function getProducts(): Promise<Product[]> {
  const raw = await apiClient.get<unknown>("/products?limit=0")
  return unwrap("/products", mapProducts(productsResponseSchema.parse(raw).products))
}