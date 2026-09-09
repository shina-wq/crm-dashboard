# CRM Customer Intelligence Dashboard — UI Specification

## 1. Purpose

This document defines the user interface and interaction requirements for the CRM Customer Intelligence Dashboard.

It describes:

* Application screens
* Design system
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

The dashboard should feel like a realistic internal CRM tool rather than a generic analytics template. It should read as a **dense, professional data tool** — closer to Linear, Vercel's dashboard, or Stripe's dashboard than to a generic admin-template screenshot.

Information should be prioritized based on how useful it is to a support or customer-facing team.

---

# 3. Design System

A design system must be defined before UI components are built. Skipping this step is what makes dashboards look like default Tailwind templates.

## 3.1 Reference Aesthetic

Target look: dense, high-contrast, data-first. Muted neutral background, one confident accent color reserved for primary actions and active states, generous use of subtle borders instead of heavy shadows. Avoid: default `bg-blue-500` buttons, default Tailwind gray scale used untouched, drop-shadow-heavy cards, rainbow-colored charts with no relationship to the rest of the UI.

## 3.2 Color System

**Governing rule: one accent color.** Indigo is the only color that means "interactive" — primary buttons, active nav state, active sort/filter indicators, links, focus rings. Nothing else in the palette competes with it. This is the actual modern pattern (Linear, Vercel, Raycast, Arc): restraint, not variety. A second or third "accent" dilutes what indigo signals — the moment three colors mean "click me," none of them do.

Every other color in this palette is **semantic or categorical only** — it never appears on a button or nav item, only on badges, banners, and chart series.

### Base neutrals (Slate)

| Token | Light | Dark |
|---|---|---|
| Background | `#F8FAFC` | `#0F172A` |
| Card / surface | `#FFFFFF` | `#1E293B` |
| Border | `#E2E8F0` | `#334155` |
| Text primary | `#0F172A` | `#F8FAFC` |
| Text secondary | `#64748B` | `#94A3B8` |

### Accent (Indigo — the only one)

| Token | Light | Dark |
|---|---|---|
| Accent | `#4F46E5` | `#6366F1` |
| Accent hover | `#4338CA` | `#818CF8` |

Used for: primary button fill, active nav item, active filter/sort state, links, focus rings. Nowhere else.

### Semantic colors

| Role | Light bg / text | Dark bg / text |
|---|---|---|
| Success | `#D1FAE5` / `#047857` | `#064E3B` / `#6EE7B7` |
| Warning | `#FEF3C7` / `#B45309` | `#78350F` / `#FDE68A` |
| Danger | `#FEE2E2` / `#B91C1C` | `#7F1D1D` / `#FCA5A5` |

Used for: form validation, error states, destructive-action confirmation, retry banners.

### Segment badges (categorical, tinted style)

Badges use a pale tinted background with saturated text of the same hue — never a solid fill, never color alone (each badge also carries its text label):

| Segment | Light bg / text | Dark bg / text |
|---|---|---|
| VIP (violet) | `#EDE9FE` / `#6D28D9` | `#4C1D95` / `#DDD6FE` |
| High Value (indigo, muted) | `#EEF2FF` / `#4338CA` | `#3730A3` / `#C7D2FE` |
| Standard (slate) | `#F1F5F9` / `#475569` | `#334155` / `#CBD5E1` |
| At Risk (amber) | `#FEF3C7` / `#B45309` | `#78350F` / `#FDE68A` |
| No Purchase History | outline only — border `#CBD5E1`, text `#64748B` | border `#475569`, text `#94A3B8` |

High Value reuses the indigo hue at a muted tint specifically because it is the second-strongest segment, adjacent in meaning to the accent — this is the one deliberate exception to "accent means only interactive," and it's still never used on a clickable element, only the badge.

### Reserved / not yet used

Cyan (`#06B6D4`) is available for a chart series if a sixth categorical color is ever needed (e.g. a line in a multi-series chart) — it is not assigned to any UI role yet. Do not add it to a button, nav item, or badge without a specific, documented reason; unused reserved colors are safer than colors added "because they look nice."

Colors are defined once as CSS variables / Tailwind theme tokens and referenced everywhere — never hardcoded per-component, and never introduced ad hoc outside this table.

## 3.3 Typography

* **Inter**, loaded via Google Fonts, is the sole typeface for the whole app. Weights 400 (body) and 500 (headings, emphasis) only — do not add 600/700, they read as heavy against the flat, low-shadow surface style in Section 3.4.
* A defined type scale: page title (20px/500), section heading (16px/500), card heading (13px/500), body text (14px/400), small/meta text (12px/400), table cell text (12–13px/400). Every text element in the app should map to one of these, not a one-off `text-[13px]`.
* Numbers in KPI cards and tables use `font-variant-numeric: tabular-nums` so figures align and don't jitter between states. Currency and large counts should also route through a shared formatter (see Section 35).

## 3.4 Spacing & Layout

* Use a consistent spacing scale (Tailwind's default 4px-based scale is fine) — do not mix arbitrary pixel values.
* Define standard card padding, table row height, and section gap once, and reuse them everywhere.
* Content max-width for dashboard pages should be fixed and consistent (see Section 4).

## 3.5 Component Library

UI primitives (select, dropdown, dialog, tooltip, combobox, popover) are built with **shadcn/ui** on top of Tailwind, not hand-rolled. This guarantees consistent styling and correct accessibility behavior across the app. See `ARCHITECTURE.md` Section 2 for the rationale.

## 3.6 Dark Mode

The application supports light and dark themes.

* Theme is toggled from the header and persisted across sessions (`localStorage`).
* Both themes are built from the same token system (Section 3.2) — dark mode is not an afterthought CSS override, it's a second value for each token.
* Charts, badges, and semantic colors must remain legible and distinguishable in both themes.
* Respect `prefers-color-scheme` as the default on first visit, before any explicit user choice.

Dark mode is a common expectation for a "modern" data tool and is inexpensive if the token system in 3.2 is followed from the start — it becomes expensive only when colors are hardcoded per-component.

---

# 4. Application Structure

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

A Settings route may exist for application-level settings (including the theme toggle if not placed in the header), but it should not contain fabricated account or CRM functionality.

---

# 5. Global Layout

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

# 6. Navigation

The sidebar should contain:

```text
Dashboard
Customers
Product Analytics
```

The active route should have a clear visual state, using the accent color defined in Section 3.2.

Navigation should remain consistent across authenticated pages.

The header should provide:

* Page title or contextual heading
* Optional page-level actions
* Theme toggle (light / dark)
* Analyst/account control

The navigation must not expose routes that do not exist.

---

# 7. Login Page

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

# 8. Dashboard Overview

The dashboard is the primary landing page after authentication.

Its purpose is to answer:

> What does the customer and purchasing data look like right now?

The page should prioritize high-level metrics first, followed by distributions and deeper insights.

---

## 8.1 KPI Section

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
* Primary value (using the tabular-numeral treatment from Section 3.3)
* Short contextual description where useful

The dashboard must not display unsupported metrics such as:

* Number of support tickets
* Customer satisfaction score
* Churn rate
* Customer activity rate

---

# 9. Customer Segment Overview

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

A chart such as a donut or bar chart may be used, colored using the segment palette defined in Section 3.2.

The exact visualization can be chosen during implementation based on readability.

---

# 10. Purchase-History Coverage

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

# 11. Spending Analysis

The dashboard should provide a visual summary of customer spending.

Possible visualizations include:

* Spending distribution
* Revenue by customer segment
* Average purchase value

The selected chart should make the distribution easy to understand.

All values must be derived from actual application data.

No artificial time-series chart should be created because DummyJSON does not provide purchase dates.

---

# 12. Product Insights

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

# 13. Customers Page

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

# 14. Customer Toolbar

The customer toolbar should provide:

* Search
* Segment filter (shadcn/ui `Select`)
* Purchase-history filter (shadcn/ui `Select`)
* Sorting (shadcn/ui `DropdownMenu`)
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

# 15. Search

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

# 16. Segment Filter

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

# 17. Purchase-History Filter

The purchase-history filter should provide:

```text
All Customers
Has Purchase History
No Purchase History
```

This allows users to explicitly find customers without purchases.

---

# 18. Sorting

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

The current sorting state should be visually clear, using the accent color, not color alone (see Section 33).

---

# 19. URL-Based Filters

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

# 20. Customer List

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

# 21. Customer Row

Each row should provide enough information for quick scanning.

Customer identity should include:

* Avatar
* Full name

The segment should use a consistent badge style from the segment palette (Section 3.2).

Customers without purchase history should clearly display:

```text
No Purchase History
```

instead of an empty value.

---

# 22. Customer Profile

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

# 23. Customer Header

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

# 24. Customer Summary

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

# 25. Purchase History

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

# 26. Purchased Products

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

# 27. Customer Insights

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

# 28. Product Analytics Page

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

# 29. Loading States

Every data-driven page must have a meaningful loading state.

Recommended approach:

* Skeleton KPI cards
* Skeleton table rows
* Skeleton chart containers
* Skeleton profile sections

Loading states should preserve the expected layout where practical to reduce visual movement, and should use the same background-layer tokens as the loaded content (no flash of unstyled or mismatched-theme content).

---

# 30. Error States

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

# 31. Empty States

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

# 32. Not Found States

If a customer ID does not correspond to a known customer:

```text
Customer not found

The requested customer does not exist.
```

Provide a way to return to the customer list.

---

# 33. Responsive Behavior

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

# 34. Accessibility

Interactive elements should:

* Have accessible names
* Be keyboard accessible
* Show visible focus states
* Use semantic HTML where appropriate
* Provide meaningful labels
* Maintain sufficient contrast in both light and dark themes

Charts should have accessible surrounding text or summaries so that important information is not available only through visual interpretation.

Status badges should not rely on color alone — pair each segment/status color with a text label (already required by Section 3.2, restated here as an accessibility requirement, not just a style preference).

---

# 35. Formatting

The interface should use consistent formatting for:

### Currency

Use a consistent currency format throughout the application.

### Numbers

Use readable number formatting for large values, with tabular numerals in KPI cards and tables (Section 3.3).

### Percentages

Use consistent decimal precision.

### Names

Display full names consistently across tables, profiles, and search.

Formatting utilities should be centralized rather than implemented independently in each component.

---

# 36. Interaction Rules

The interface should provide immediate feedback for user actions.

Examples:

* Filter changes update results
* Search updates customer results
* Sorting updates the displayed order
* Pagination changes the current result page
* Clicking a customer opens their profile
* Browser back returns to the previous filtered customer view where possible
* Logout clears authentication state and returns to login
* Toggling the theme updates immediately without a page reload

Destructive actions are not part of the core CRM scope.

---

# 37. Visual Consistency

The following UI elements should have consistent styles, driven by the tokens defined in Section 3:

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

# 38. Data Honesty in the UI

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

# 39. Core User Flows

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

# 40. Primary UX Principle

The dashboard should optimize for **customer investigation and data understanding**, not for maximizing the number of charts or UI elements.

Every displayed metric should answer a useful question.

Every interaction should have a clear purpose.

When the available data cannot support a feature honestly, the feature should be excluded rather than simulated.