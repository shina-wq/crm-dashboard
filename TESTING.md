# CRM Customer Intelligence Dashboard — Testing Strategy

## 1. Purpose

This document defines the testing strategy for the CRM Customer Intelligence Dashboard.

Testing focuses on:

* Business-critical data transformations
* Customer segmentation
* Analytics calculations
* Important UI behavior
* Routing and authentication
* Loading, error, and empty states
* Critical customer investigation flows

The goal is to verify **user-visible behavior and business rules**, not implementation details.

---

# 2. Testing Stack

The application uses:

* **Vitest** — test runner and assertions
* **React Testing Library** — component and user behavior testing
* **jsdom** — browser-like test environment

Tests should use Testing Library queries and user interactions rather than relying on component internals.

---

# 3. Testing Principles

The test suite should follow these principles:

1. Test behavior rather than implementation.
2. Prioritize business-critical logic.
3. Keep pure business logic easy to test.
4. Avoid testing third-party libraries.
5. Avoid excessive snapshot testing.
6. Use realistic test data.
7. Test important edge cases.
8. Keep tests deterministic.
9. Mock external API boundaries rather than testing the API itself.
10. Prefer a smaller set of meaningful tests over large amounts of low-value coverage.

---

# 4. Testing Layers

Testing is divided into three main layers:

```text
Unit Tests
    ↓
Component Tests
    ↓
Integration Tests
```

Each layer has a different responsibility.

---

# 5. Unit Tests

Unit tests cover pure functions and business logic that can be tested without rendering React components.

Primary targets:

* Data transformations
* Customer metric calculations
* Customer segmentation
* Product analytics
* Formatting utilities
* URL parameter parsing where applicable

---

# 6. Data Transformation Tests

The transformation layer converts DummyJSON API resources into application domain models.

Tests should verify that:

### User → Customer

A user is correctly transformed into a customer identity and contact structure.

### Cart → Purchase

The cart mapping preserves:

```text
cart.id
cart.userId
cart.total
cart.discountedTotal
cart.totalProducts
cart.totalQuantity
cart.products
```

### User + Carts → Customer

Users and carts are correctly joined using `userId`.

---

# 7. Customer Join Tests

The customer transformation must preserve the complete user population.

Given:

```text
208 users
50 carts
```

the transformation should produce:

```text
208 customers
```

Tests should verify:

* Every user becomes a customer.
* Matching carts are attached to the correct customer.
* Carts are never assigned to another user.
* Users without carts remain in the result.
* Users without carts receive an empty purchase array.

---

# 8. Missing Purchase Data Tests

A customer with no matching cart should produce:

```ts
{
  purchases: [],
  purchaseCount: 0,
  totalSpend: 0,
  averagePurchaseValue: 0,
  totalQuantity: 0,
  purchaseStatus: "no-history",
  segment: null
}
```

The test suite must ensure that such customers are not incorrectly assigned a segment.

---

# 9. Customer Metric Tests

Test each derived metric independently.

### Purchase Count

```text
number of purchases
```

### Total Spend

```text
sum of discountedTotal
```

### Average Purchase Value

```text
totalSpend / purchaseCount
```

When purchase count is zero:

```text
averagePurchaseValue = 0
```

### Total Quantity

```text
sum of purchase.totalQuantity
```

Tests should include:

* One purchase
* Multiple purchases
* No purchases
* Decimal monetary values
* Zero values

---

# 10. Segmentation Tests

Segmentation is one of the most important business rules in the application.

Tests should cover every segment defined in `SEGMENTATION.md`.

### VIP

```text
highSpend = true
highFrequency = true

→ VIP
```

### High Value

```text
highSpend = true
highFrequency = false

→ High Value
```

and:

```text
highSpend = false
highFrequency = true

→ High Value
```

### At Risk

```text
lowSpend = true
lowFrequency = true

→ At Risk
```

### Standard

Customers that satisfy none of the above conditions should receive:

```text
Standard
```

---

# 11. Segmentation Boundary Tests

Threshold boundaries must be tested explicitly.

For example:

```text
totalSpend === highSpendThreshold
```

must behave consistently with the documented `>=` rule.

Likewise:

```text
totalSpend === lowSpendThreshold
```

must behave consistently with the documented `<=` rule.

This prevents subtle changes to percentile or comparison logic from changing customer classifications unexpectedly.

---

# 12. Segmentation Priority Tests

Overlapping conditions must follow the documented priority:

```text
No Purchase History
        ↓
VIP
        ↓
High Value
        ↓
At Risk
        ↓
Standard
```

A customer satisfying both VIP and High Value conditions must receive:

```text
VIP
```

A customer with no purchases must receive:

```text
segment = null
```

regardless of threshold values.

---

# 13. Degenerate Threshold Tests

The dataset may contain limited purchase-frequency variation.

Tests should cover the case where:

```text
lowFrequency === highFrequency
```

The segmentation implementation must not create artificial distinctions between customers when the underlying metric does not provide meaningful variation.

This behavior should follow the final implementation rule documented in `SEGMENTATION.md`.

---

# 14. Product Analytics Tests

Product analytics should be tested independently from UI rendering.

### Top Products by Quantity

Verify that:

```text
quantityPurchased =
sum of line-item quantities
```

for each product.

### Most Popular Products

Verify that:

```text
purchaseCount =
number of distinct purchases containing the product
```

A product appearing twice in the same purchase must count as **one purchase**, not two.

---

# 15. Product Analytics Edge Cases

Tests should cover:

* Product appearing in one purchase
* Product appearing in multiple purchases
* Multiple quantities in one purchase
* Products with zero quantity where applicable
* Multiple products with equal rankings
* Missing product metadata
* Empty purchase collections

---

# 16. Formatting Tests

Shared formatting utilities should be tested for:

* Currency
* Numbers
* Percentages
* Names
* Empty or missing values where applicable

Formatting tests should verify output rather than internal implementation.

---

# 17. Component Testing

React components should be tested through user-visible behavior.

Important components include:

* Login form
* Customer search
* Customer filters
* Customer table
* Segment badges
* Purchase-status indicators
* Pagination
* Error states
* Empty states
* Loading states
* Customer profile sections
* Navigation

---

# 18. Login Tests

The login flow should verify:

### Valid Login

```text
Enter valid demo credentials
        ↓
Submit
        ↓
Dashboard displayed
```

### Invalid Login

Verify that:

* Login does not succeed.
* An error message is shown.
* The user remains on the login page.

### Required Fields

Submitting missing credentials should display validation feedback.

### Persistent Authentication

A valid authentication state should survive a page refresh according to the application's authentication implementation.

### Logout

Logout should:

```text
Clear authentication state
        ↓
Redirect to /login
```

---

# 19. Protected Route Tests

Unauthenticated users attempting to access protected routes should be redirected to:

```text
/login
```

Protected routes include:

```text
/dashboard
/customers
/customers/:id
/products
```

Authenticated users should be able to access these routes.

---

# 20. Customer Search Tests

Tests should verify that searching:

* Finds matching first names.
* Finds matching last names.
* Finds matching full names.
* Finds matching emails.
* Is case-insensitive.
* Updates the displayed results.
* Shows an empty state when there are no matches.

Example:

```text
Search: "john"

→ only matching customers are displayed
```

---

# 21. Customer Filter Tests

Test each filter independently and in combination.

### Segment

```text
VIP
High Value
Standard
At Risk
```

### Purchase History

```text
Has Purchase History
No Purchase History
```

Tests should verify that multiple active filters are combined correctly.

For example:

```text
Segment = VIP
+
Purchase History = Has History
```

should only show customers satisfying both conditions.

---

# 22. URL State Tests

Customer filters should be reflected in URL search parameters.

Tests should verify that:

* Applying a filter updates the URL.
* Search updates the URL where specified.
* Sorting updates the URL.
* Pagination updates the URL.
* Loading a URL with existing parameters restores the correct filter state.
* Browser navigation preserves expected filter behavior.

Example:

```text
/customers?segment=vip&purchaseHistory=has&page=2
```

must produce the corresponding customer view.

---

# 23. Sorting Tests

Test sorting by supported fields:

* Customer name
* Total spend
* Purchase count
* Average purchase value

For each field, test:

```text
Ascending
Descending
```

The displayed order should match the selected sorting state.

---

# 24. Pagination Tests

Test that:

* The correct page is displayed.
* Next page changes the results.
* Previous page returns to the previous results.
* Pagination respects active filters.
* Page state is represented in the URL.
* Invalid page values are handled safely.

Pagination controls should be disabled where no further page exists.

---

# 25. Customer Profile Tests

Selecting a customer should open:

```text
/customers/:id
```

The profile should display:

* Customer identity
* Contact information
* Location
* Segment
* Purchase status
* Purchase count
* Total spend
* Average purchase value
* Total quantity
* Purchase history

---

# 26. Customer Without Purchase History

A profile for a customer without purchases should display:

```text
No Purchase History
```

and:

```text
Total Purchases = 0
Total Spend = 0
Average Purchase Value = 0
Total Quantity = 0
```

The profile must not display:

* Fake purchase dates
* Fake purchases
* Fake activity
* Fake churn information

---

# 27. Customer Not Found

Navigating to an invalid customer ID should display a dedicated not-found state.

Example:

```text
Customer not found

The requested customer does not exist.
```

The user should have a clear way to return to the customer list.

---

# 28. Loading State Tests

Every major data-driven page should have loading-state coverage.

Test that:

* Skeletons or loading indicators appear while data is loading.
* Main content is not shown as if loading had completed.
* Loading state disappears after successful data retrieval.

Important areas:

* Dashboard
* Customers
* Customer Profile
* Product Analytics

---

# 29. Error State Tests

API failures should produce clear user-facing error states.

Tests should verify:

* Error message is displayed.
* Retry action is available where appropriate.
* Raw API errors are not unnecessarily exposed.
* Successful retry restores the expected content.

If multiple independent resources exist on a page, failure of one resource should not automatically hide unrelated successfully loaded data.

---

# 30. Empty State Tests

Test the distinction between:

```text
Loading
Error
No Data
No Search Results
No Purchase History
No Matching Filters
```

Each state should provide appropriate messaging.

A blank page or empty container should not be used as a substitute for meaningful state handling.

---

# 31. Dashboard Tests

The dashboard should be tested at the behavior level.

Verify that it displays:

* Customer count
* Customers with purchase history
* Purchase count
* Total revenue
* Segment distribution
* Purchase-history coverage
* Spending insights
* Product insights

The exact numerical values should be generated from controlled test fixtures rather than hardcoded production values.

---

# 32. Dashboard Data Integrity Tests

Verify that dashboard metrics are consistent with the underlying customer dataset.

For example:

```text
Total Customers
=
customers.length
```

and:

```text
Customers with Purchase History
=
customers.filter(hasHistory).length
```

and:

```text
Total Revenue
=
sum(customer.totalSpend)
```

This helps prevent different pages from calculating the same business metric differently.

---

# 33. Product Analytics Component Tests

Verify that the product analytics interface:

* Displays ranked products.
* Shows quantity purchased correctly.
* Shows distinct purchase count correctly.
* Displays product ratings where available.
* Handles missing or empty product data.

The UI should not confuse:

```text
Top Products by Quantity
```

with:

```text
Most Popular Products
```

---

# 34. Navigation Tests

Test important navigation flows:

```text
Login
 ↓
Dashboard
 ↓
Customers
 ↓
Customer Profile
```

and:

```text
Dashboard
 ↓
Product Analytics
```

Navigation should produce the expected route and page content.

---

# 35. Integration Tests

Integration tests should verify important flows across multiple components.

Priority flows:

### Authentication Flow

```text
Login
 ↓
Dashboard
 ↓
Logout
 ↓
Login
```

### Customer Investigation Flow

```text
Dashboard
 ↓
Customers
 ↓
Search
 ↓
Filter
 ↓
Customer
 ↓
Profile
```

### URL State Flow

```text
Customers
 ↓
Apply filters
 ↓
URL changes
 ↓
Refresh
 ↓
Filters remain applied
```

---

# 36. API Mocking

External API requests should be mocked in tests.

Tests should not depend on live DummyJSON responses.

This provides:

* Deterministic tests
* Faster execution
* Reliable CI
* Controlled error scenarios
* Controlled edge cases

Mock data should resemble the real API structure.

---

# 37. Test Fixtures

Reusable fixtures should be created for common scenarios.

Examples:

```text
singleUser
userWithPurchase
userWithoutPurchase
multiplePurchases
vipCustomer
highValueCustomer
standardCustomer
atRiskCustomer
multipleProducts
emptyDataset
```

Fixtures should remain small and focused.

Avoid creating one enormous fixture for every test.

---

# 38. Test Organization

Tests should live close to the code they test where practical.

Example:

```text
src/
├── features/
│   ├── customers/
│   │   ├── components/
│   │   ├── utils/
│   │   └── *.test.ts
│   │
│   └── dashboard/
│       └── *.test.ts
│
├── lib/
│   ├── formatters.ts
│   └── formatters.test.ts
│
└── test/
    ├── fixtures/
    └── mocks/
```

The exact structure may change as the implementation develops.

---

# 39. Accessibility Testing

Important interactive UI should be tested for accessible behavior.

Tests should verify:

* Buttons have accessible names.
* Inputs have labels.
* Interactive controls can be reached by keyboard.
* Important status information is available to assistive technologies.
* Forms expose validation feedback appropriately.

Accessibility testing should focus on meaningful user behavior rather than checking every generated DOM attribute.

---

# 40. Snapshot Testing

Snapshot tests should be used sparingly.

They should not be the primary testing strategy for:

* Customer tables
* Dashboard pages
* Customer profiles
* Large component trees

Behavioral assertions are preferred because they are more resilient to intentional visual changes.

---

# 41. What Should Not Be Tested

The test suite should not spend significant effort testing:

* React internals
* TanStack Query internals
* React Router internals
* Tailwind CSS classes individually
* Recharts internals
* DummyJSON itself
* Implementation details that users cannot observe

The goal is to test application behavior.

---

# 42. Critical Test Priority

If development time is limited, testing priority should be:

### Priority 1

* Customer transformation
* Customer metrics
* Segmentation
* Product analytics
* Authentication
* Customer search and filtering

### Priority 2

* URL filter state
* Customer profile
* Loading/error/empty states
* Pagination
* Sorting

### Priority 3

* Detailed visual behavior
* Secondary UI interactions
* Non-critical formatting edge cases

---

# 43. Definition of Done

The application should not be considered complete until:

* Core transformation logic has unit tests.
* Segmentation rules have full coverage.
* Product analytics have unit tests.
* Customer search and filtering are tested.
* Authentication flow is tested.
* Protected routes are tested.
* Customer profile behavior is tested.
* Loading, error, and empty states are tested.
* URL-based filtering is tested.
* Critical navigation flows are tested.
* Tests pass consistently in CI.
* Tests do not depend on the live DummyJSON API.

---

# 44. Testing Principle

The test suite should protect the application's most important promise:

> **The CRM dashboard must turn imperfect external data into correct, useful, and honest customer insights.**

Tests should therefore focus most heavily on the transformations and business rules that make that possible.
