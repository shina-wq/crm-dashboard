export type Customer = {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  image: string
  company: string
  country: string
  city: string
}

export type CustomerSegment = "high-value" | "mid-value" | "low-value" | "no-purchase"

export type CustomerMetrics = {
  customerId: number
  purchaseCount: number
  totalSpending: number
  averagePurchaseValue: number
  segment: CustomerSegment
}