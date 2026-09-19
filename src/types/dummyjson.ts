import { z } from "zod"

const idSchema = z.number().int().positive()
const moneySchema = z.number().nonnegative()
const optionalText = z.string().optional()

export const dummyJsonUserSchema = z.object({
  id: idSchema,
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phone: optionalText,
  image: optionalText,
  company: z.object({ name: optionalText }).optional(),
  address: z.object({ country: optionalText, city: optionalText }).optional(),
})

export const dummyJsonProductSchema = z.object({
  id: idSchema,
  title: z.string(),
  category: z.string(),
  price: moneySchema,
  discountPercentage: moneySchema,
  rating: moneySchema,
  stock: z.number().int().nonnegative(),
  description: optionalText,
  brand: optionalText,
  thumbnail: optionalText,
})

const dummyJsonCartItemSchema = z.object({
  id: idSchema,
  title: z.string(),
  price: moneySchema,
  quantity: z.number().int().positive(),
  total: moneySchema,
  discountedTotal: moneySchema,
})

export const dummyJsonCartSchema = z.object({
  id: idSchema,
  userId: idSchema,
  total: moneySchema,
  discountedTotal: moneySchema,
  totalQuantity: z.number().int().nonnegative(),
  products: z.array(dummyJsonCartItemSchema).min(1),
})

// Envelopes: records stay `unknown` so one bad record can't fail the whole list.
export const usersResponseSchema = z.object({ users: z.array(z.unknown()) })
export const productsResponseSchema = z.object({ products: z.array(z.unknown()) })
export const cartsResponseSchema = z.object({ carts: z.array(z.unknown()) })

export type DummyJsonUser = z.infer<typeof dummyJsonUserSchema>
export type DummyJsonProduct = z.infer<typeof dummyJsonProductSchema>
export type DummyJsonCart = z.infer<typeof dummyJsonCartSchema>