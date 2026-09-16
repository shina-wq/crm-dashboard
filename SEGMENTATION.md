# Customer Segmentation

## 1. Purpose

Groups customers into behavioral categories based on purchase activity. Deterministic — same input always produces the same segment.

## 2. Available Data

* `Customer`, `Purchase` (has `total`, `customerId`)
* 208 customers, 50 purchases

No purchase timestamps exist. Segmentation must not use recency or fabricated dates.

## 3. Customer Metrics

```text
purchaseCount = purchases.filter(p => p.customerId === customer.id).length
totalSpending = sum(purchase.total for that customer)
averagePurchaseValue = purchaseCount > 0 ? totalSpending / purchaseCount : 0
```

## 4. Segments

| Segment        | Definition                                                  |
| -------------- | ------------------------------------------------------------ |
| High Value     | Multiple purchases and high total spending                   |
| Active         | At least one purchase, doesn't meet High Value criteria      |
| Low Engagement | One purchase with relatively low spending                    |
| No Purchase    | Zero purchases                                                |

Describes observed behavior only — not a prediction of churn, LTV, or future behavior.

## 5. Threshold Population

Both thresholds below are computed over **customers with `purchaseCount >= 1`** (not all 208 customers, not just `>= 2`). This is the single population used for both `HIGH_VALUE_SPENDING_THRESHOLD` and `LOW_ENGAGEMENT_SPENDING_THRESHOLD`.

```text
purchasingCustomers = customers.filter(c => c.purchaseCount >= 1)
spendValues = purchasingCustomers.map(c => c.totalSpending).sort(ascending)
```

## 6. Percentile Method

Use linear interpolation (same as Excel `PERCENTILE.INC` / numpy default), for a deterministic, reproducible result:

```text
percentile(sortedValues, p):
  if sortedValues.length === 0: return Infinity   // see §9
  if sortedValues.length === 1: return sortedValues[0]

  rank = p * (sortedValues.length - 1)
  lower = floor(rank)
  upper = ceil(rank)
  if lower === upper: return sortedValues[lower]

  weight = rank - lower
  return sortedValues[lower] + weight * (sortedValues[upper] - sortedValues[lower])
```

```text
HIGH_VALUE_SPENDING_THRESHOLD   = percentile(spendValues, 0.75)
LOW_ENGAGEMENT_SPENDING_THRESHOLD = percentile(spendValues, 0.50)   // median
```

## 7. High Value

```text
purchaseCount >= 2
AND totalSpending >= HIGH_VALUE_SPENDING_THRESHOLD
```

## 8. Active

```text
purchaseCount >= 1
AND not High Value
AND not Low Engagement
```

## 9. Low Engagement

```text
purchaseCount === 1
AND totalSpending < LOW_ENGAGEMENT_SPENDING_THRESHOLD
```

## 10. No Purchase

```text
purchaseCount === 0
```

## 11. Edge Cases

* **`spendValues` is empty** (no customer has ever purchased): `percentile()` returns `Infinity`. No customer can satisfy `totalSpending >= Infinity`, so nobody is classified High Value — everyone with `purchaseCount >= 1` falls to Active or Low Engagement correctly, and `purchaseCount === 0` still yields No Purchase.
* **`spendValues` has exactly 1 value**: `percentile()` returns that single value. A lone purchasing customer compares against their own spend.
* **Tie at threshold**: comparisons use `>=` / `<`, so a value exactly at the threshold counts toward the higher tier (High Value at `>=`, Low Engagement excludes the median itself since it uses `<`).

## 12. Evaluation Order

```text
1. No Purchase       (purchaseCount === 0)
2. High Value        (purchaseCount >= 2 AND totalSpending >= threshold)
3. Low Engagement    (purchaseCount === 1 AND totalSpending < threshold)
4. Active             (everything else with purchaseCount >= 1)
```

## 13. Segment Metadata

```ts
type CustomerSegment = "high-value" | "active" | "low-engagement" | "no-purchase"
```

| Segment        | CRM Focus                          |
| -------------- | ----------------------------------- |
| High Value     | Retain and strengthen relationship  |
| Active         | Encourage repeat purchases          |
| Low Engagement | Encourage deeper engagement         |
| No Purchase    | Acquisition or onboarding           |

## 14. Derived Model

Segmentation is derived data, not a mutation of `Customer`:

```ts
type CustomerMetrics = {
  customerId: number
  purchaseCount: number
  totalSpending: number
  averagePurchaseValue: number
  segment: CustomerSegment
}
```

Computed by one function: `computeCustomerMetrics(customers: Customer[], purchases: Purchase[]): CustomerMetrics[]`. Because thresholds are dataset-relative (§5–6), segmentation cannot be computed per-customer in isolation — it always requires the full customer + purchase set.

## 15. Determinism

No `Math.random()`, no current time, no fabricated dates, no external state. Same data in → same segments out.

## 16. Limitations

No real purchase dates, activity timestamps, churn data, or LTV. Segments must never be presented as churn risk, LTV, loyalty, recency, or predicted future behavior.

## 17. Why Not RFM

Frequency and monetary value are available; recency is not (no timestamps). Fabricating dates to complete RFM would produce misleading segments. This model uses **Frequency + Monetary** only.

## 18. Dashboard Usage

All views (Dashboard breakdown, Customer list filter, Customer profile, Segments page) must read from the same `computeCustomerMetrics` output. One source of truth — no view re-derives segmentation independently.