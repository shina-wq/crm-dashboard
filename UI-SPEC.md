# CRM Customer Intelligence Dashboard — UI Specification

## 1. Purpose

This document defines the user interface and interaction requirements for the CRM Customer Intelligence Dashboard.

It describes:

* Application screens
* Page structure
* Navigation
* Information hierarchy
* Filters and controls
* Tables and cards
* Customer profile views
* Data visualizations
* Responsive behavior
* Loading, error, and empty states
* Accessibility expectations

The specification defines **what the interface should provide**, while implementation details remain in `architecture.md`.

---

# 2. Design Goals

The interface should be:

* Clear
* Professional
* Data-focused
* Responsive
* Easy to scan
* Consistent
* Accessible
* Honest about missing data

The dashboard should feel like a realistic internal CRM tool rather than a generic analytics template.

Information should be prioritized based on how useful it is to a support or customer-facing team.

---

# 3. Application Structure

The application contains four primary areas:

```text
Login
  │
  ▼
Dashboard
  │
  ├── Customers
  │     └── Customer Profile
  │
  └── Product Analytics
```

The primary navigation should provide access to:

* Dashboard
* Customers
* Product Analytics

Authentication controls should provide:

* Current analyst identity
* Logout

A Settings route may exist for application-level settings, but it should not contain fabricated account or CRM functionality.

---

# 4. Global Layout

Authenticated pages use a shared application shell.

```text
┌──────────────────────────────────────────────────────┐
│ Sidebar │ Header                                      │
│         ├──────────────────────────────────────────────│
│         │                                              │
│         │ Page Content                                 │
│         │                                              │
│         │                                              │
│         │                                              │
└──────────────────────────────────────────────────────┘
```

## Desktop

* Persistent sidebar
* Top header
* Main content area
* Dashboard content centered within a readable maximum width

## Tablet

* Collapsible sidebar
* Header remains visible
* Content grid adapts to available width

## Mobile

* Sidebar becomes compact navigation
* Content uses a single-column layout
* Wide tables are replaced or adapted into mobile-friendly layouts
* Secondary information should not create horizontal scrolling where avoidable

---

# 5. Navigation

The sidebar should contain:

```text
Dashboard
Customers
Product Analytics
```

The active route should have a clear visual state.

Navigation should remain consistent across authenticated pages.

The header should provide:

* Page title or contextual heading
* Optional page-level actions
* Analyst/account control

The navigation must not expose routes that do not exist.

---

# 6. Login Page

The login page provides the demo authentication entry point.

## Required Elements

* Application branding
* Email or username field
* Password field
* Login button
* Validation feedback

The login experience represents a demo analyst account rather than real backend authentication.

## Validation

Invalid or missing credentials should produce clear feedback.

The form should:

* Prevent submission when required fields are invalid
* Show useful validation messages
* Disable or indicate submission state when appropriate

## Successful Login

After successful authentication:

```text
/login
   ↓
/dashboard
```

Authenticated users should not remain on the login page.

---

# 7. Dashboard Overview

The dashboard is the primary landing page after authentication.

Its purpose is to answer:

> What does the customer and purchasing data look like right now?

The page should prioritize high-level metrics first, followed by distributions and deeper insights.

---

## 7.1 KPI Section

The first section should contain key customer and purchasing metrics.

Recommended KPIs:

* Total Customers
* Customers with Purchase History
* Total Purchases
* Total Revenue

Additional useful metrics may include:

* Average Purchase Value
* Purchase-History Coverage

KPI cards should provide:

* Clear metric label
* Primary value
* Short contextual description where useful

The dashboard must not display unsupported metrics such as:

* Number of support tickets
* Customer satisfaction score
* Churn rate
* Customer activity rate

---

# 8. Customer Segment Overview

The dashboard should display the distribution of customer segments.

Supported segments:

```text
VIP
High Value
Standard
At Risk
```

Customers with no purchase history should be shown separately.

The visualization should make it clear that:

```text
No Purchase History
```

is a purchase-status state rather than a customer segment.

A chart such as a donut or bar chart may be used.

The exact visualization can be chosen during implementation based on readability.

---

# 9. Purchase-History Coverage

The dashboard should show how much of the customer population has purchase data.

Conceptually:

```text
Customers
├── With Purchase History
└── No Purchase History
```

This is important because the dataset contains substantially more users than purchases.

The interface should not hide customers without purchases.

---

# 10. Spending Analysis

The dashboard should provide a visual summary of customer spending.

Possible visualizations include:

* Spending distribution
* Revenue by customer segment
* Average purchase value

The selected chart should make the distribution easy to understand.

All values must be derived from actual application data.

No artificial time-series chart should be created because DummyJSON does not provide purchase dates.

---

# 11. Product Insights

The dashboard should provide a concise product-performance section.

It should include:

### Top Products by Quantity

Shows products with the highest total quantity purchased.

### Most Popular Products

Shows products appearing in the largest number of distinct purchases.

These are separate metrics and should not be presented as if they measure the same thing.

Product information may include:

* Product image
* Product name
* Quantity purchased
* Number of purchases
* Rating

---

# 12. Customers Page

The Customers page is the primary customer investigation interface.

Its purpose is to allow users to quickly find and compare customers.

The page should contain:

```text
Page Header
    ↓
Search + Filters
    ↓
Customer Results
    ↓
Pagination
```

---

# 13. Customer Toolbar

The customer toolbar should provide:

* Search
* Segment filter
* Purchase-history filter
* Sorting
* Pagination controls where appropriate

Search and filters should work together.

Example:

```text
Search: "john"
Segment: VIP
Purchase History: Has history
```

The results should satisfy all active conditions.

---

# 14. Search

Search should allow users to find customers by useful identity information.

At minimum:

* First name
* Last name
* Full name
* Email

Search should be case-insensitive.

If no customers match the query, display a dedicated empty state.

Example:

```text
No customers found

Try adjusting your search or filters.
```

---

# 15. Segment Filter

The segment filter should provide:

```text
All Segments
VIP
High Value
Standard
At Risk
```

`No Purchase History` should not appear as a segment option.

It belongs to the purchase-history filter.

---

# 16. Purchase-History Filter

The purchase-history filter should provide:

```text
All Customers
Has Purchase History
No Purchase History
```

This allows users to explicitly find customers without purchases.

---

# 17. Sorting

The customer list should support sorting by useful fields.

Recommended fields:

* Customer name
* Total spend
* Purchase count
* Average purchase value

Sorting should support:

```text
Ascending
Descending
```

The current sorting state should be visually clear.

---

# 18. URL-Based Filters

Search, filtering, sorting, and pagination should be represented in the URL.

Example:

```text
/customers?segment=vip&purchaseHistory=has&page=2
```

The interface should preserve URL state when:

* Refreshing the page
* Sharing the URL
* Using browser navigation

Changing filters should update the URL.

---

# 19. Customer List

The customer list should contain all **208 customers**, including customers without purchase history.

Desktop should use a data table.

Recommended columns:

| Column          | Purpose                  |
| --------------- | ------------------------ |
| Customer        | Name and avatar          |
| Email           | Contact information      |
| Segment         | Customer segment         |
| Purchase Status | Has history / No history |
| Purchases       | Number of purchases      |
| Total Spend     | Customer spending        |
| Actions         | View customer            |

The table should support horizontal scrolling only when necessary.

---

# 20. Customer Row

Each row should provide enough information for quick scanning.

Customer identity should include:

* Avatar
* Full name

The segment should use a consistent badge style.

Customers without purchase history should clearly display:

```text
No Purchase History
```

instead of an empty value.

---

# 21. Customer Profile

Selecting a customer opens:

```text
/customers/:id
```

The profile page should provide a detailed view of one customer.

Recommended structure:

```text
Customer Header
      ↓
Customer Summary
      ↓
Purchase Metrics
      ↓
Purchase History
      ↓
Purchased Products
      ↓
Derived Insights
```

---

# 22. Customer Header

The profile header should contain:

* Customer avatar
* Full name
* Email
* Phone
* Location
* Segment
* Purchase status

The page should provide an obvious way to return to the customer list.

---

# 23. Customer Summary

The profile should display:

* Total purchases
* Total spend
* Average purchase value
* Total quantity purchased

For customers without purchase history:

```text
Total Purchases: 0
Total Spend: 0
Average Purchase Value: 0
Total Quantity: 0
```

The UI should also explain that purchase history is unavailable.

---

# 24. Purchase History

Customers with purchases should see their purchase history.

Each purchase should display:

* Purchase ID
* Number of products
* Total quantity
* Purchase total
* Discounted total

Purchase dates must not be displayed because DummyJSON does not provide them.

The interface should not invent dates.

---

# 25. Purchased Products

The profile should show products contained in the customer's purchases.

Useful information includes:

* Product image
* Product name
* Quantity
* Unit price
* Discount
* Discounted total

Products may appear more than once when they occur in different purchases.

The UI should preserve the distinction between:

```text
Product
```

and:

```text
Purchase Item
```

---

# 26. Customer Insights

The profile may provide derived insights based strictly on available data.

Examples:

```text
High-value customer based on total spend.

Customer has purchased across multiple purchases.

Customer has no available purchase history.
```

Insights must be deterministic and based on existing customer metrics.

The application must not claim:

```text
Customer is likely to churn.
Customer has been inactive for 90 days.
Customer is dissatisfied.
```

because those conclusions require data that DummyJSON does not provide.

---

# 27. Product Analytics Page

The Product Analytics page provides a deeper view of purchasing patterns.

It should contain:

### Top Products by Quantity

Ranked by:

```text
total quantity purchased
```

### Most Popular Products

Ranked by:

```text
number of distinct purchases containing the product
```

### Product Ratings

Product ratings may be displayed alongside purchasing metrics.

The page should make it clear that product rating and purchasing popularity are different metrics.

---

# 28. Loading States

Every data-driven page must have a meaningful loading state.

Recommended approach:

* Skeleton KPI cards
* Skeleton table rows
* Skeleton chart containers
* Skeleton profile sections

Loading states should preserve the expected layout where practical to reduce visual movement.

---

# 29. Error States

If an API request fails, the relevant area should display:

* Clear error message
* Retry action

Example:

```text
Unable to load customer data.

Please try again.
```

The interface should avoid exposing raw API errors directly to users.

If only one section fails, the entire application should not necessarily become unusable.

---

# 30. Empty States

Empty states must explain why content is missing.

### No Search Results

```text
No customers found

Try adjusting your search or filters.
```

### No Purchase History

```text
No Purchase History

This customer has no purchase data available.
```

### No Product Results

```text
No product data available.
```

Empty states must be distinct from loading and error states.

---

# 31. Not Found States

If a customer ID does not correspond to a known customer:

```text
Customer not found

The requested customer does not exist.
```

Provide a way to return to the customer list.

---

# 32. Responsive Behavior

## Desktop

Prioritize information density.

```text
Sidebar
  +
Multi-column dashboard
  +
Full customer table
```

Customer profiles may use multiple columns for summary information.

---

## Tablet

The layout should:

* Collapse or reduce navigation
* Reduce dashboard columns
* Maintain readable table content
* Stack profile sections where necessary

---

## Mobile

The interface should become single-column.

Dashboard:

```text
KPI
↓
KPI
↓
Chart
↓
Chart
```

Customer list should prioritize:

```text
Customer
Segment
Purchase Status
Key Metric
```

Less important fields may move into a customer detail view.

Customer profile sections should stack vertically.

---

# 33. Accessibility

Interactive elements should:

* Have accessible names
* Be keyboard accessible
* Show visible focus states
* Use semantic HTML where appropriate
* Provide meaningful labels
* Maintain sufficient contrast

Charts should have accessible surrounding text or summaries so that important information is not available only through visual interpretation.

Status badges should not rely on color alone.

---

# 34. Formatting

The interface should use consistent formatting for:

### Currency

Use a consistent currency format throughout the application.

### Numbers

Use readable number formatting for large values.

### Percentages

Use consistent decimal precision.

### Names

Display full names consistently across tables, profiles, and search.

Formatting utilities should be centralized rather than implemented independently in each component.

---

# 35. Interaction Rules

The interface should provide immediate feedback for user actions.

Examples:

* Filter changes update results
* Search updates customer results
* Sorting updates the displayed order
* Pagination changes the current result page
* Clicking a customer opens their profile
* Browser back returns to the previous filtered customer view where possible
* Logout clears authentication state and returns to login

Destructive actions are not part of the core CRM scope.

---

# 36. Visual Consistency

The following UI elements should have consistent styles:

* Buttons
* Inputs
* Select controls
* Badges
* Cards
* Tables
* Empty states
* Error states
* Loading skeletons
* Page headings

Customer segments should use distinct visual treatments, but meaning must not depend on color alone.

---

# 37. Data Honesty in the UI

The UI must never imply that unsupported information exists.

Do not display:

* Fake purchase dates
* Fake account creation dates
* Fake support tickets
* Fake customer satisfaction scores
* Fake activity timelines
* Fake churn probabilities
* Fake CRM interactions

When information is unavailable, communicate that explicitly.

---

# 38. Core User Flows

## Login

```text
Login
 ↓
Dashboard
```

## Investigate Customers

```text
Dashboard
 ↓
Customers
 ↓
Search / Filter
 ↓
Customer
 ↓
Customer Profile
```

## Analyze Products

```text
Dashboard
 ↓
Product Analytics
 ↓
Product Purchasing Metrics
```

## Filtered Customer Investigation

```text
Customers
 ↓
Apply Filters
 ↓
URL Updated
 ↓
Filtered Results
 ↓
Customer Profile
```

---

# 39. Primary UX Principle

The dashboard should optimize for **customer investigation and data understanding**, not for maximizing the number of charts or UI elements.

Every displayed metric should answer a useful question.

Every interaction should have a clear purpose.

When the available data cannot support a feature honestly, the feature should be excluded rather than simulated.
