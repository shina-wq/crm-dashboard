# CRM Customer Intelligence Dashboard — Architecture

## 1. Architecture Goals

The application should be:

* Modular and maintainable
* Type-safe
* Efficient in API usage
* Responsive
* Easy to test
* Clear in its separation of concerns
* Honest about the limitations of the DummyJSON API

The architecture separates **API data**, **derived CRM data**, **application state**, and **UI components**.

---

## 2. Technology Stack

| Area           | Technology                     |
| -------------- | ------------------------------- |
| Framework      | React                           |
| Language       | TypeScript                      |
| Build Tool     | Vite                            |
| Routing        | React Router                    |
| Server State   | TanStack Query                  |
| Styling        | Tailwind CSS                    |
| UI Primitives  | shadcn/ui (Radix-based)         |
| Charts         | Recharts                        |
| Forms          | React Hook Form                 |
| Validation     | Zod                             |
| Icons          | Lucide React                    |
| Testing        | Vitest + React Testing Library  |
| CI             | GitHub Actions                  |
| Data Source    | DummyJSON                       |
| Deployment     | Vercel                          |

### Why shadcn/ui

Tailwind alone means hand-building accessible dropdowns, dialogs, comboboxes, and popovers from scratch. shadcn/ui provides Radix-based primitives (dropdown, dialog, combobox, popover, tooltip, select) with correct keyboard navigation, focus management, and ARIA behavior out of the box, styled with Tailwind so they stay visually consistent with the rest of the app.

Use shadcn/ui for:

* Segment filter / purchase-history filter (`Select`)
* Customer search (`Command` / combobox)
* Sort controls (`DropdownMenu`)
* Any modal or confirmation UI (`Dialog`)
* Tooltips on truncated table cells (`Tooltip`)

Do not use shadcn/ui for one-off layout containers, cards, or anything simple enough to build directly with Tailwind. Reaching for a primitive when a `div` and two classes would do is unnecessary overhead.

---

## 3. High-Level Data Flow

```text
DummyJSON API
     │
     ├── Users
     ├── Carts
     └── Products
          │
          ▼
     API Services
          │
          ▼
    TanStack Query
          │
          ▼
 Data Transformation Layer
          │
          ▼
   CRM Domain Models
          │
          ▼
        UI
```

Raw DummyJSON responses should not be passed throughout the application. API data is transformed into application-specific models before being consumed by most UI components.

---

## 4. API Fetching Strategy

### Users

Fetch the complete user population in one request:

```text
GET /users?limit=0
```

### Carts

Fetch all carts in one request:

```text
GET /carts?limit=0
```

### Products

Products are fetched separately when product information is required.

### Customer Join

Users and carts are joined client-side using `userId`.

```text
Users (208)
     +
Carts (50)
     ↓
Customer records (208)
```

Every user remains in the customer dataset, including users without purchase history.

Individual requests such as:

```text
/users/:id/carts
```

should not be used to populate the customer list.

This keeps the initial customer data load to two bulk requests instead of potentially hundreds of requests.

---

## 5. Data Transformation

The application uses a dedicated transformation layer to convert API resources into CRM-oriented data.

Example:

```text
DummyJSON User
      +
DummyJSON Cart(s)
      ↓
Customer
```

A derived customer model may contain:

```text
Customer
├── identity
├── contact information
├── segment
├── purchaseStatus
├── purchaseCount
├── totalSpend
├── averagePurchaseValue
└── purchases
```

Raw API models and derived application models should remain separate.

---

## 6. Purchase Mapping

The UI uses the term **Purchase** rather than Cart.

Internally, the application retains DummyJSON terminology where appropriate.

For this application:

> Each DummyJSON cart is treated as one completed purchase.

Therefore:

```text
cart.id          → purchase.id
cart.userId      → purchase.customerId
cart.total       → purchase.total
cart.products    → purchase.products
```

This mapping is documented and consistent throughout the application.

---

## 7. State Management

Different types of state should have different owners.

### Server State

Managed with **TanStack Query**:

* Users
* Carts
* Products
* Loading states
* Errors
* Caching
* Refetching

### URL State

Stored in URL search parameters:

* Search query
* Segment filter
* Purchase-history filter
* Sort field
* Sort direction
* Pagination

Example:

```text
/customers?segment=vip&purchaseHistory=has&page=2
```

This makes filtered views refreshable and shareable.

### Local UI State

React state should handle temporary interface state such as:

* Sidebar state
* Dropdowns
* Modal visibility
* Selected UI elements
* Theme preference (light / dark), persisted to `localStorage`

### Authentication State

Demo authentication is stored persistently on the client.

Authentication is a frontend demonstration only; it is not intended to provide production security.

---

## 8. Routing

The application uses React Router.

```text
/login

/dashboard

/customers
/customers/:id

/settings
```

Protected application routes require authentication.

Unauthenticated users are redirected to `/login`.

---

## 9. Project Structure

The project should use a feature-oriented structure where practical.

```text
src/
├── app/
│   ├── App.tsx
│   └── routes.tsx
│
├── components/
│   ├── ui/            (shadcn/ui primitives)
│   ├── layout/
│   └── shared/
│
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── customers/
│   └── products/
│
├── services/
│   ├── users.ts
│   ├── carts.ts
│   └── products.ts
│
├── hooks/
│
├── lib/
│   ├── api.ts
│   ├── formatters.ts
│   └── utils.ts
│
├── types/
│   ├── api.ts
│   └── domain.ts
│
├── pages/
│
├── main.tsx
└── index.css
```

### Responsibilities

**`services/`**

* API requests
* No UI logic

**`types/`**

* API response types
* Application/domain types

**`features/`**

* Feature-specific components, hooks, transformations, and logic

**`components/ui/`**

* shadcn/ui primitives and other reusable presentational components

**`lib/`**

* Generic utilities and shared infrastructure

**`pages/`**

* Route-level composition

---

## 10. Component Architecture

Components should follow a clear hierarchy:

```text
Page
 ↓
Feature component
 ↓
Reusable component
 ↓
UI primitive
```

For example:

```text
CustomersPage
 ├── CustomerToolbar
 │    ├── SearchInput
 │    └── FilterSelect
 │
 └── CustomerTable
      └── CustomerRow
           ├── CustomerAvatar
           └── StatusBadge
```

Components should avoid owning data-fetching logic when that logic belongs to a feature hook or service.

---

## 11. Derived Analytics

Metrics should be calculated from the fetched dataset rather than hardcoded.

Examples include:

* Customer count
* Customers with purchase history
* Total revenue
* Purchase count
* Total quantity purchased
* Spending distributions
* Segment distributions
* Product purchasing metrics

Derived calculations should be centralized where practical so different pages do not implement the same business logic differently.

---

## 12. Customer Segmentation

Customer segmentation is part of the transformation/business-logic layer.

The segmentation logic should not be embedded directly inside UI components.

```text
Customer purchase data
        ↓
Segmentation logic
        ↓
VIP / High Value / Standard / At Risk
```

`No Purchase History` is represented separately as `purchaseStatus` and is not a customer segment.

The exact segmentation rules are defined in `SEGMENTATION.md`.

---

## 13. Product Analytics

Product analytics are derived from product and purchase line-item data.

Two distinct metrics are supported:

### Top Products by Quantity

Products with the highest total quantity purchased.

### Most Popular Products

Products appearing in the greatest number of distinct purchases.

These metrics should not be treated as interchangeable.

---

## 14. Data Integrity Rules

The application must not fabricate backend data.

DummyJSON does not provide reliable fields for:

* Support tickets
* Customer satisfaction scores
* Account creation dates
* Purchase dates
* Activity timestamps

Features requiring these fields should not be implemented using invented values.

Missing purchase data should instead be represented explicitly through the customer's `purchaseStatus`.

---

## 15. Loading, Error, and Empty States

Every data-driven feature should account for:

### Loading

Use skeletons or appropriate loading indicators.

### Error

Display a clear error state with a retry action where possible.

### Empty

Distinguish between:

* No data exists
* No search results
* No purchase history
* No matching filters

Empty states should communicate why the state exists rather than simply displaying a blank area.

---

## 16. Performance

The application should avoid unnecessary network requests and repeated expensive calculations.

Key decisions:

* Bulk-fetch users and carts
* Cache server data with TanStack Query
* Avoid per-user API requests
* Derive customer data from the existing datasets
* Memoize expensive client-side transformations when necessary
* Use pagination for large customer tables
* Keep chart data derived from existing application state

The dataset is small enough that aggressive optimization is unnecessary. Readability and correctness take priority.

---

## 17. Responsive Architecture

The interface should be designed for three primary layouts:

### Desktop

* Persistent sidebar
* Multi-column dashboard
* Full customer table

### Tablet

* Collapsible navigation
* Reduced grid columns
* Adapted table layout

### Mobile

* Compact navigation
* Single-column dashboard
* Customer list optimized for narrow screens
* Secondary information moved into expandable/detail views

Responsive behavior should be designed intentionally rather than relying only on automatic CSS wrapping.

---

## 18. Testing Strategy

Testing focuses on business logic and important user behavior.

### Unit Tests

Test:

* Data transformations
* Customer segmentation
* Purchase calculations
* Product analytics
* Formatting utilities

### Component Tests

Test:

* Customer filtering
* Search
* Empty states
* Loading states
* Error states
* Important interactive components

### Integration-Level Tests

Test critical flows such as:

```text
Login
  ↓
Dashboard
  ↓
Customers
  ↓
Customer Profile
```

Tests should prioritize behavior and outcomes rather than implementation details.

Test priority and phasing are defined in `TESTING.md`, Section 42. Do not treat every section of `TESTING.md` as required before the UI is functional — Priority 1 items come first.

---

## 19. Continuous Integration

The project uses **GitHub Actions** to keep the test suite and type checks honest on every push.

### Pipeline

```text
on: push, pull_request
     ↓
Install dependencies (npm ci)
     ↓
Type check (tsc --noEmit)
     ↓
Lint
     ↓
Unit + component tests (vitest run)
     ↓
Build (vite build)
```

### Requirements

* CI must run on every pull request targeting `main`.
* A failing type check, lint, test, or build fails the pipeline.
* Tests must not depend on the live DummyJSON API (see `TESTING.md`, Section 36) — CI has no network access to it and must not need one.
* The pipeline should complete in a few minutes given the size of this project; no test sharding or caching complexity is needed at this scale.

### Example Workflow

```text
.github/workflows/ci.yml

name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

A green CI badge in the repository README is part of the project's presentation, not just a safety net.

---

## 20. Architecture Principles

The project follows these principles:

1. **Use real data.** Do not fabricate API fields.
2. **Fetch efficiently.** Prefer bulk requests over per-resource requests.
3. **Separate API and domain models.**
4. **Keep business logic outside UI components.**
5. **Use the right state solution for each type of state.**
6. **Make important filters URL-addressable.**
7. **Design for incomplete data.**
8. **Prefer simple architecture over unnecessary abstraction.**
9. **Test business-critical logic.**
10. **Optimize for maintainability and clarity over premature performance optimization.**
11. **Enforce quality automatically.** Type checks, lint, and tests run in CI on every change, not just locally.