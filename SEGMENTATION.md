# Customer Segmentation

## 1. Purpose

Groups customers into spend-based tiers using purchase activity. Deterministic — same input always produces the same segment.

## 2. Available Data

* `Customer`, `Purchase` (has `total`, `customerId`)
* 208 customers, 208 purchases (currently exactly one purchase per customer — the logic must not depend on this)

No purchase timestamps exist. Segmentation must not use recency or fabricated dates.

## 3. Customer Metrics

```text
purchaseCount = purchases.filter(p => p.customerId === customer.id).length
totalSpending = sum(purchase.total for that customer)
averagePurchaseValue = purchaseCount > 0 ? totalSpending / purchaseCount : 0
```

## 4. Segments

| Segment     | Definition                                                     |
| ----------- | -------------------------------------------------------------- |
| High Value  | Spending in the top quartile of purchasing customers           |
| Mid Value   | At least one purchase, spending between the two thresholds     |
| Low Value   | Spending in the bottom quartile of purchasing customers        |
| No Purchase | Zero purchases                                                  |

Tiers are relative to this dataset's spend distribution. They describe observed spending only — not engagement, loyalty, recency, or a prediction of churn, LTV, or future behavior.

## 5. Threshold Population

Both thresholds are computed over **customers with `purchaseCount >= 1`** (not all 208 customers).

```text
purchasingCustomers = customers.filter(c => c.purchaseCount >= 1)
spendValues = purchasingCustomers.map(c => c.totalSpending).sort(ascending)
```

## 6. Percentile Method

Use linear interpolation (same as Excel `PERCENTILE.INC` / numpy default), for a deterministic, reproducible result:

```text
percentile(sortedValues, p):
  if sortedValues.length === 0: return Infinity   // see §11
  if sortedValues.length === 1: return sortedValues[0]

  rank = p * (sortedValues.length - 1)
  lower = floor(rank)
  upper = ceil(rank)
  if lower === upper: return sortedValues[lower]

  weight = rank - lower
  return sortedValues[lower] + weight * (sortedValues[upper] - sortedValues[lower])
```

```text
HIGH_VALUE_SPENDING_THRESHOLD = percentile(spendValues, 0.75)
LOW_VALUE_SPENDING_THRESHOLD  = percentile(spendValues, 0.25)
```

## 7. High Value

```text
purchaseCount >= 1
AND totalSpending >= HIGH_VALUE_SPENDING_THRESHOLD
```

## 8. Mid Value

```text
purchaseCount >= 1
AND not High Value
AND not Low Value
```

## 9. Low Value

```text
purchaseCount >= 1
AND totalSpending < LOW_VALUE_SPENDING_THRESHOLD
```

## 10. No Purchase

```text
purchaseCount === 0
```

## 11. Edge Cases

* **`spendValues` is empty** (nobody has purchased): thresholds are never used, because every customer is No Purchase. `percentile()` returns `Infinity` only so the function is total.
* **`spendValues` has exactly 1 value**: both thresholds equal that value. The lone purchaser is High Value (`>=` is checked first).
* **All purchasers spend the same amount**: both thresholds are equal, so everyone is High Value.
* **Tie at a threshold**: High Value uses `>=` (a tie counts toward the higher tier); Low Value uses `<` (a tie at the low threshold stays Mid Value).
* **Distribution**: with distinct spend values, expect roughly 25% High, 50% Mid, 25% Low. Ties can shift this.

## 12. Evaluation Order

```text
1. No Purchase   (purchaseCount === 0)
2. High Value    (totalSpending >= HIGH_VALUE_SPENDING_THRESHOLD)
3. Low Value     (totalSpending <  LOW_VALUE_SPENDING_THRESHOLD)
4. Mid Value     (everything else with purchaseCount >= 1)
```

## 13. Segment Metadata

```ts
type CustomerSegment = "high-value" | "mid-value" | "low-value" | "no-purchase"
```

| Segment     | CRM Focus                          |
| ----------- | ---------------------------------- |
| High Value  | Retain and strengthen relationship |
| Mid Value   | Grow spend per customer            |
| Low Value   | Encourage deeper engagement        |
| No Purchase | Acquisition or onboarding          |

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

No real purchase dates, activity timestamps, churn data, or LTV. Segments must never be presented as churn risk, LTV, loyalty, engagement, recency, or predicted future behavior.

## 17. Why Spend-Only

In the current dataset every customer has exactly one purchase, so purchase frequency never varies and cannot separate customers. Recency is unavailable (no timestamps). Fabricating dates to complete RFM would produce misleading segments. This model uses **monetary value only**. If purchases per customer ever vary, frequency can be added back as a rule.

## 18. Dashboard Usage

All views (Dashboard breakdown, Customer list filter, Customer profile, Segments page) must read from the same `computeCustomerMetrics` output. One source of truth — no view re-derives segmentation independently.