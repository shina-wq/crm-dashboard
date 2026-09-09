# CRM Customer Intelligence Dashboard — Data Model

## 1. Purpose

This document defines the data models used by the CRM Customer Intelligence Dashboard.

The application works with two distinct layers of data:

1. **API models** — represent the raw DummyJSON responses.
2. **Domain models** — represent the CRM-oriented data used by the application.

Keeping these models separate prevents API-specific structures from leaking throughout the UI and makes the application easier to maintain if the data source changes.

---

## 2. Data Sources

The application uses three DummyJSON resources:

```text
Users
Carts
Products
```

The primary relationship is:

```text
User
  │
  │ userId
  ▼
Cart
  │
  │ products[]
  ▼
Product
```

The application combines these resources into a customer-focused domain model.

---

## 3. API Models

API models represent the structures returned directly by DummyJSON.

They should be defined separately from application/domain types.

---

## 4. User Model

A DummyJSON user contains identity, contact, demographic, and address information.

The application only needs fields that support the CRM experience.

Conceptual model:

```ts
type ApiUser = {
  id: number
  firstName: string
  lastName: string
  maidenName: string
  age: number
  gender: string
  email: string
  phone: string
  username: string
  image: string
  address: {
    address: string
    city: string
    state: string
    stateCode: string
    postalCode: string
    country: string
  }
}
```

Additional DummyJSON user fields may exist and can be retained in the API type when useful.

The domain model should only expose fields required by the application.

---

## 5. Cart Model

A DummyJSON cart represents the raw purchase source.

Conceptual model:

```ts
type ApiCart = {
  id: number
  userId: number
  products: ApiCartProduct[]
  total: number
  discountedTotal: number
  userId: number
  totalProducts: number
  totalQuantity: number
}
```

The application treats each cart as one completed purchase.

The raw API model remains named `ApiCart`.

The domain model uses the term `Purchase`.

---

## 6. Cart Product Model

Each cart contains product line-item information.

Conceptual model:

```ts
type ApiCartProduct = {
  id: number
  title: string
  price: number
  quantity: number
  total: number
  discountPercentage: number
  discountedTotal: number
  thumbnail: string
}
```

This data is used to calculate product purchasing metrics.

---

## 7. Product Model

Products are fetched separately from DummyJSON.

Conceptual model:

```ts
type ApiProduct = {
  id: number
  title: string
  description: string
  category: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  brand: string
  thumbnail: string
  images: string[]
}
```

Only fields relevant to the application's product analytics and UI should be exposed through the domain model.

---

# 8. Domain Models

Domain models represent the application's own understanding of the data.

They should not depend on DummyJSON naming where that naming does not match the user-facing CRM experience.

---

## 9. Customer

`Customer` is the primary domain model.

It combines a DummyJSON user with their associated purchases and derived metrics.

```ts
type Customer = {
  id: number

  identity: {
    firstName: string
    lastName: string
    fullName: string
    image: string
  }

  contact: {
    email: string
    phone: string
  }

  location: {
    city: string
    state: string
    country: string
  }

  segment: CustomerSegment | null

  purchaseStatus: PurchaseStatus

  purchaseCount: number
  totalSpend: number
  averagePurchaseValue: number
  totalQuantity: number

  purchases: Purchase[]
}
```

The customer ID is the DummyJSON user ID.

---

## 10. Customer Segment

Customer segments are defined in `SEGMENTATION.md`.

```ts
type CustomerSegment =
  | "vip"
  | "high-value"
  | "standard"
  | "at-risk"
```

A customer without purchase history has:

```ts
segment: null
```

`no-history` must not be added to `CustomerSegment`.

---

## 11. Purchase Status

Purchase status describes whether purchase data exists for a customer.

```ts
type PurchaseStatus =
  | "has-history"
  | "no-history"
```

This is intentionally separate from customer segmentation.

For example:

```text
purchaseStatus = "no-history"
segment = null
```

is valid.

---

## 12. Purchase

A DummyJSON cart is represented as a `Purchase` in the application's domain model.

```ts
type Purchase = {
  id: number
  customerId: number
  total: number
  discountedTotal: number
  totalProducts: number
  totalQuantity: number
  products: PurchaseItem[]
}
```

Mapping:

```text
cart.id              → purchase.id
cart.userId          → purchase.customerId
cart.total           → purchase.total
cart.discountedTotal → purchase.discountedTotal
cart.totalProducts   → purchase.totalProducts
cart.totalQuantity   → purchase.totalQuantity
cart.products        → purchase.products
```

---

## 13. Purchase Item

A purchase item represents a product line item inside a purchase.

```ts
type PurchaseItem = {
  productId: number
  title: string
  price: number
  quantity: number
  total: number
  discountPercentage: number
  discountedTotal: number
  thumbnail: string
}
```

`productId` is the DummyJSON product ID.

---

## 14. Product Domain Model

The product domain model represents product information used by the dashboard.

```ts
type Product = {
  id: number
  title: string
  category: string
  price: number
  rating: number
  stock: number
  thumbnail: string
}
```

Additional product fields can remain in the API model without being included in the domain model when they are not needed.

---

# 15. Relationships

The application's data relationships are:

```text
User
 │
 │ 1
 │
 ├───────────────┐
 │               │
 │               │
 ▼               ▼
Customer      Purchase
                 │
                 │ *
                 ▼
            PurchaseItem
                 │
                 │ productId
                 ▼
              Product
```

More specifically:

```text
User.id = Cart.userId

Cart.id = Purchase.id

Cart.userId = Purchase.customerId

PurchaseItem.productId = Product.id
```

---

# 16. Customer Transformation

Customer records are created by joining users and carts.

```text
Users
  +
Carts
  ↓
Group carts by userId
  ↓
Map each user
  ↓
Create Customer
```

Every user must produce exactly one customer record.

This means:

```text
208 Users
   ↓
208 Customers
```

Customers without matching carts receive an empty purchase array.

```ts
{
  purchases: [],
  purchaseCount: 0,
  totalSpend: 0,
  totalQuantity: 0,
  averagePurchaseValue: 0,
  purchaseStatus: "no-history",
  segment: null
}
```

---

# 17. Customer Derived Metrics

The following fields are calculated rather than received directly from the API.

### Purchase Count

```ts
purchaseCount = purchases.length
```

### Total Spend

```ts
totalSpend =
  sum(purchase.discountedTotal)
```

### Average Purchase Value

```ts
averagePurchaseValue =
  purchaseCount > 0
    ? totalSpend / purchaseCount
    : 0
```

### Total Quantity

```ts
totalQuantity =
  sum(purchase.totalQuantity)
```

These values must be derived consistently across the application.

---

# 18. Purchase Value

The dashboard uses `discountedTotal` as the customer's actual purchase value.

Therefore:

```text
Customer Spend
      ↓
Purchase.discountedTotal
      ↓
Σ discountedTotal
```

The original `total` remains available for comparison where needed, but it is not the primary customer-spend metric.

This prevents the dashboard from mixing pre-discount and post-discount values.

---

# 19. Product Analytics Data

Product analytics are calculated from purchase line items.

The application supports two separate metrics.

### Top Products by Quantity

Total quantity of each product purchased:

```ts
quantityPurchased =
  sum(purchaseItem.quantity)
```

### Most Popular Products

Number of distinct purchases containing each product:

```ts
purchaseCount =
  count(distinct purchase.id)
```

These metrics must remain separate.

A product can have:

```text
high quantity
low purchase count
```

or:

```text
low quantity
high purchase count
```

Therefore, they represent different types of product performance.

---

# 20. Analytics Models

A derived product analytics record can use:

```ts
type ProductAnalytics = {
  productId: number
  title: string
  quantityPurchased: number
  purchaseCount: number
  rating: number
  thumbnail: string
}
```

This model combines product information with purchasing metrics.

---

# 21. Segment Distribution

Dashboard segment charts should use a derived aggregation rather than hardcoded values.

Conceptual model:

```ts
type SegmentDistribution = {
  segment: CustomerSegment
  customerCount: number
}
```

Customers with `segment = null` should be handled separately as the **No Purchase History** population.

---

# 22. Spending Distribution

Spending charts should be generated from customer `totalSpend` values.

Customers without purchase history may be excluded from spending distributions because their spend is zero and they do not represent purchasing behavior.

The UI should make this scope clear where necessary.

---

# 23. API vs Domain Model Rules

The application must maintain a clear boundary between API and domain models.

### API Models

Responsible for:

* Matching DummyJSON responses
* Representing external API data
* Supporting API services

### Domain Models

Responsible for:

* Representing CRM concepts
* Supporting application logic
* Providing UI-friendly structures
* Containing derived metrics
* Hiding unnecessary API-specific details

The UI should primarily consume domain models.

---

# 24. Data Transformation Layer

Transformations should be centralized in dedicated functions.

Conceptual functions:

```ts
mapUserToCustomer()
mapCartToPurchase()
mapCartProductToPurchaseItem()
buildCustomers()
calculateCustomerMetrics()
calculateSegment()
calculateProductAnalytics()
```

These functions should be pure where possible.

They should not:

* Fetch data
* Modify React state
* Access the DOM
* Depend on route state
* Render UI

---

# 25. Data Ownership

The application follows these ownership rules:

```text
services/
    Raw API data

transformation/domain logic
    Derived CRM data

TanStack Query
    Server-state lifecycle

URL search params
    Shareable filter state

React state
    Temporary UI state

components
    Presentation and interaction
```

No component should become the source of truth for derived customer data.

---

# 26. Missing Data Rules

Missing purchase data must be represented explicitly.

For a customer without purchases:

```ts
{
  purchaseCount: 0,
  totalSpend: 0,
  averagePurchaseValue: 0,
  totalQuantity: 0,
  purchases: [],
  purchaseStatus: "no-history",
  segment: null
}
```

The application must not create:

* Fake purchases
* Fake purchase dates
* Fake activity
* Fake customer value
* Fake churn scores

---

# 27. Data Integrity Rules

The domain layer must preserve the meaning of the source data.

Rules:

1. Every DummyJSON user becomes one customer.
2. Users and carts are joined by `userId`.
3. Every matching cart becomes one purchase.
4. Every purchase retains its original cart ID.
5. Purchase items retain their product IDs.
6. Customer spend uses `discountedTotal`.
7. Customers without purchases remain visible.
8. Missing purchase history does not produce a segment.
9. Product analytics are derived from purchase line items.
10. No unsupported backend data is invented.

---

# 28. Example Customer

A transformed customer may look conceptually like:

```ts
{
  id: 12,

  identity: {
    firstName: "John",
    lastName: "Doe",
    fullName: "John Doe",
    image: "..."
  },

  contact: {
    email: "john@example.com",
    phone: "..."
  },

  location: {
    city: "New York",
    state: "New York",
    country: "United States"
  },

  segment: "high-value",

  purchaseStatus: "has-history",

  purchaseCount: 2,
  totalSpend: 845.50,
  averagePurchaseValue: 422.75,
  totalQuantity: 8,

  purchases: [
    {
      id: 1,
      customerId: 12,
      total: 500,
      discountedTotal: 450,
      totalProducts: 3,
      totalQuantity: 5,
      products: []
    }
  ]
}
```

The exact values above are illustrative. Production UI data must come from DummyJSON.

---

# 29. Type Organization

Types should be separated into API and domain files.

```text
src/
└── types/
    ├── api.ts
    └── domain.ts
```

### `api.ts`

Contains:

```text
ApiUser
ApiCart
ApiCartProduct
ApiProduct
```

### `domain.ts`

Contains:

```text
Customer
CustomerSegment
PurchaseStatus
Purchase
PurchaseItem
Product
ProductAnalytics
SegmentDistribution
```

This separation makes the API boundary explicit.

---

# 30. Design Principles

The data model follows these principles:

1. **Keep API and domain models separate.**
2. **Use explicit relationships.**
3. **Derive metrics from source data.**
4. **Keep transformations deterministic.**
5. **Represent missing data explicitly.**
6. **Do not fabricate unavailable information.**
7. **Use domain terminology in the UI.**
8. **Keep business rules outside components.**
9. **Make derived values consistent across features.**
10. **Prefer simple models over unnecessary abstraction.**
