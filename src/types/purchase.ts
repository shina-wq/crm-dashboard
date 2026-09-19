export type PurchaseStatus = "completed" | "processing" | "cancelled"

export type PurchaseItem = {
  productId: number
  title: string
  price: number
  quantity: number
  total: number
  discountedPrice: number
  discountedTotal: number
}

export type Purchase = {
  id: number
  customerId: number
  total: number
  discountedTotal: number
  totalQuantity: number
  status: PurchaseStatus
  items: PurchaseItem[]
}