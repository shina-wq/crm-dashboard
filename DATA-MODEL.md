# Data Model

## Overview

The CRM Dashboard uses DummyJSON as its external data source but does **not** expose DummyJSON's raw API models directly to the application.

The application transforms the external data into a small set of domain models:

* `Customer`
* `Purchase`
* `PurchaseItem`
* `Product`

The application also derives business values such as purchase status, customer segments, and dashboard metrics from these models.

### Core principle

> External API models are mapped into application-specific domain models at the data boundary. Raw DummyJSON objects must not leak into the UI or domain logic.

This keeps the application independent from the external API's exact field names and unnecessary data.

---

# 1. Data Sources

The application uses three DummyJSON endpoints.

| Endpoint            | Purpose                                      | Source of truth |
| ------------------- | -------------------------------------------- | --------------- |
| `/users?limit=0`    | Customer information                         | Customers       |
| `/carts?limit=0`    | Purchase information and purchase line items | Purchases       |
| `/products?limit=0` | Product catalog                              | Products        |

The application fetches these datasets independently and joins them client-side.

### Dataset sizes

The current dataset contains:

* **208 customers**
* **50 purchases**
* **Products from the full DummyJSON catalog**

A cart represents one completed purchase in the application.

---

# 2. Domain Models

## 2.1 Customer

A `Customer` represents a customer using the CRM.

The application does not use the complete DummyJSON `User` object.

### Domain shape

```ts
type Customer = {
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
```

### Mapping

The application selects only customer-relevant fields from the DummyJSON user:

| DummyJSON User    | Customer    |
| ----------------- | ----------- |
| `id`              | `id`        |
| `firstName`       | `firstName` |
| `lastName`        | `lastName`  |
| `email`           | `email`     |
| `phone`           | `phone`     |
| `image`           | `image`     |
| `company.name`    | `company`   |
| `address.country` | `country`   |
| `address.city`    | `city`      |

The following API fields are intentionally excluded because they have no role in the CRM domain:

* `bank`
* `crypto`
* `hair`
* `ip`
* `macAddress`
* `userAgent`
* `ein`
* `ssn`
* other unrelated profile metadata

The raw `User` object should never be passed directly to UI components.

---

# 3. Product

A `Product` represents a product in the application's catalog.

The product catalog is sourced from:

`/products?limit=0`

### Domain shape

```ts
type Product = {
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
}
```

The catalog is the **source of truth for current product information**.

Products should not be reconstructed from cart line items.

---

# 4. Purchase

A `Purchase` represents one completed customer transaction.

DummyJSON does not provide a dedicated order history API. Instead, each DummyJSON cart is mapped to exactly one purchase.

### Domain shape

```ts
type Purchase = {
  id: number
  customerId: number
  total: number
  discountedTotal: number
  totalQuantity: number
  status: PurchaseStatus
  items: PurchaseItem[]
}
```

### Mapping

| DummyJSON Cart    | Purchase           |
| ----------------- | ------------------ |
| `id`              | `id`               |
| `userId`          | `customerId`       |
| `total`           | `total`            |
| `discountedTotal` | `discountedTotal`  |
| `totalProducts`   | derived from items |
| `totalQuantity`   | `totalQuantity`    |
| `products`        | `items`            |

There is no actual purchase timestamp because DummyJSON carts do not provide one.

The application must **not fabricate timestamps**.

---

# 5. Purchase Item

A `PurchaseItem` represents a product as it appeared at the time of purchase.

```ts
type PurchaseItem = {
  productId: number
  title: string
  price: number
  quantity: number
  total: number
  discountedPrice: number
  discountedTotal: number
}
```

These values come from the products nested inside the DummyJSON cart.

### Important distinction

Purchase items are **historical snapshots**, not the product catalog.

For example:

```text
Product Catalog
    Product #12
        Current price: $120

Purchase #4
    Product #12
        Purchase price: $100
```

The purchase should retain its own line-item values.

The application should therefore never replace purchase-item prices with the current catalog price.

---

# 6. Relationships

The core relationships are:

```text
Customer
   │
   │ 1
   │
   ├───────────< Purchase
                  │
                  │ 1
                  │
                  └───────────< PurchaseItem
                                  │
                                  │ references
                                  ▼
                               Product
```

### Relationships

**Customer → Purchase**

* One customer can have zero or more purchases.
* A purchase belongs to one customer.
* `Purchase.customerId` references `Customer.id`.

**Purchase → PurchaseItem**

* One purchase contains one or more purchase items.
* Each item represents a product included in that purchase.

**PurchaseItem → Product**

* `PurchaseItem.productId` references `Product.id`.
* The catalog provides current product information.
* The purchase item retains its own historical purchase values.

---

# 7. Data Flow

The application retrieves the three datasets separately:

```text
/users
    │
    ▼
Customer[]

/carts
    │
    ▼
Purchase[]

/products
    │
    ▼
Product[]
```

The datasets are then joined using stable identifiers:

```text
User.id
   │
   └──→ Customer.id

Cart.userId
   │
   └──→ Purchase.customerId

Cart.products[].id
   │
   └──→ PurchaseItem.productId
              │
              └──→ Product.id
```

The UI works with the resulting domain models rather than raw API responses.

---

# 8. Derived Data

Not every value shown by the dashboard exists directly in DummyJSON.

The application derives several values from the domain models.

## Purchase Status

DummyJSON does not provide a purchase status.

The application therefore assigns a deterministic status using a fixed rule.

The status must always produce the same result for the same purchase ID.

```ts
type PurchaseStatus =
  | "completed"
  | "processing"
  | "cancelled"
```

### Deterministic rule

Status is derived from the purchase ID:

```text
id % 10

0–6 → completed
7–8 → processing
9   → cancelled
```

This gives the application a stable distribution without introducing randomness.

The status is a **presentation/demo value**, not real transactional data.

It must never be generated with `Math.random()`.

---

# 9. Dashboard Metrics

Dashboard metrics are derived from the domain collections.

### Total Customers

```text
customers.length
```

### Total Purchases

```text
purchases.length
```

### Average Order Value

```text
sum(purchase.total) / purchases.length
```

AOV is calculated from the original purchase totals.

### Purchase Status Breakdown

Count purchases grouped by `status`.

```text
completed
processing
cancelled
```

### Top Products

Products can be ranked by the total quantity purchased across all purchase items.

```text
sum(PurchaseItem.quantity)
```

The dashboard may also display product popularity based on purchase frequency where appropriate.

### Customer Metrics

Customer-level metrics are derived by joining purchases through:

```text
Purchase.customerId === Customer.id
```

Examples include:

* Number of purchases
* Total spending
* Average purchase value
* Customer segment

Customer segmentation rules are documented separately in `segmentation.md`.

---

# 10. Source of Truth

The application maintains clear ownership of each type of information.

| Information                 | Source of truth                 |
| --------------------------- | ------------------------------- |
| Customer profile            | `Customer` mapped from `/users` |
| Current product information | `Product` from `/products`      |
| Purchase information        | `Purchase` mapped from `/carts` |
| Historical purchase values  | `PurchaseItem`                  |
| Purchase status             | Deterministic application rule  |
| Customer segment            | Application segmentation logic  |
| Dashboard metrics           | Derived from domain data        |

The product catalog and purchase items must not be treated as interchangeable.

---

# 11. What Is Not Modeled

The following are intentionally outside the current CRM domain:

* Support tickets
* Customer messages
* Sales representatives
* Leads
* Opportunities
* Invoices
* Payment methods
* Real purchase dates
* Customer activity timestamps
* Real order status
* Customer notes

These would require data that DummyJSON does not provide and should not be fabricated simply to make the dashboard appear more complete.

---

# 12. Data Modeling Principles

The CRM follows these rules:

1. **Keep external API models separate from domain models.**
2. **Only keep data that the application actually uses.**
3. **Use stable IDs for relationships.**
4. **Treat the product catalog as the product source of truth.**
5. **Treat purchase items as historical snapshots.**
6. **Never fabricate unavailable data unless explicitly modeled as demo/derived data.**
7. **Keep derived business rules deterministic.**
8. **Keep segmentation logic in `segmentation.md`.**
9. **Keep API and application architecture details in `architecture.md`.**
10. **Keep UI-specific concerns out of the data model.**

This separation keeps the data layer predictable and makes the application easier to change if the external API is replaced later.
