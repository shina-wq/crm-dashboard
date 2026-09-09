# CRM Customer Intelligence Dashboard — Customer Segmentation

## 1. Purpose

Customer segmentation groups customers into meaningful purchasing segments based on the purchase data available from DummyJSON.

Segmentation is a **derived business rule**. It is calculated from the application's customer domain model and must not be embedded directly inside UI components.

The segmentation system is designed to:

* Identify high-value customers
* Identify customers with relatively low purchasing engagement
* Provide useful grouping for dashboard analysis
* Remain deterministic and reproducible
* Avoid making claims that cannot be supported by the available data

---

## 2. Available Data

DummyJSON provides users and carts that can be joined using `userId`.

The current dataset contains:

* **208 users**
* **50 carts**

Each cart provides information including:

* `userId`
* `total`
* `discountedTotal`
* `totalProducts`
* `totalQuantity`
* Product line items

DummyJSON does not provide reliable purchase dates, activity timestamps, or historical customer behavior. Therefore, segmentation cannot measure true churn, retention, or time-based customer risk.

---

## 3. Segment Types

Customers with purchase history are assigned to one of four segments:

1. **VIP**
2. **High Value**
3. **Standard**
4. **At Risk**

Customers without purchase history are **not assigned a segment**.

They instead receive:

```text
purchaseStatus = "no-history"
```

This distinction is important because having no available purchase data is different from having low purchasing engagement.

---

## 4. Customer Metrics

Segmentation uses metrics derived from the customer's purchase history.

### Total Spend

The customer's total spend is the sum of the `discountedTotal` value of their purchases.

```text
totalSpend = Σ purchase.discountedTotal
```

The discounted total is used because it represents the final value after the cart discount.

### Purchase Count

The number of purchases associated with the customer.

```text
purchaseCount = number of purchases
```

### Total Quantity

The total number of product units purchased.

```text
totalQuantity = Σ purchase.totalQuantity
```

Total quantity is useful for analytics but is not a primary segmentation metric.

---

## 5. Dataset-Derived Thresholds

Fixed monetary thresholds are intentionally avoided.

For example, the application should not define:

```text
VIP = spend > $10,000
```

because such a threshold would be arbitrary and tied to a particular dataset.

Instead, thresholds are calculated from the distribution of customers who have purchase history.

### Spend Thresholds

Among customers with purchase history:

```text
High Spend = 75th percentile of totalSpend
Low Spend  = 25th percentile of totalSpend
```

### Purchase Frequency Thresholds

Among customers with purchase history:

```text
High Frequency = 75th percentile of purchaseCount
Low Frequency  = 25th percentile of purchaseCount
```

Percentile thresholds make the segmentation relative to the actual dataset rather than based on invented business assumptions.

---

## 6. Important Dataset Constraint

The dataset contains significantly more users than purchases.

Because there are 208 users but only 50 carts, most customers have no purchase history. In addition, many customers with purchases may have only one purchase.

Therefore, purchase frequency may have limited discriminatory value.

The implementation must calculate the actual distribution before applying frequency thresholds.

If the 25th and 75th percentiles of `purchaseCount` are equal, purchase frequency must **not** be treated as a meaningful differentiator.

In that case, segmentation should rely primarily on total spend rather than creating artificial differences between customers with the same purchase frequency.

This prevents the segmentation system from producing misleading classifications simply to satisfy a four-segment model.

---

## 7. Segment Rules

### VIP

A customer is classified as **VIP** when they demonstrate both high spending and high purchasing engagement.

```text
highSpend AND highFrequency
```

VIP customers represent the strongest purchasing customers within the available dataset.

---

### High Value

A customer is classified as **High Value** when they meet at least one high-value condition:

```text
highSpend OR highFrequency
```

Customers who qualify as VIP are assigned to VIP first.

Therefore:

```text
VIP > High Value
```

in classification priority.

---

### At Risk

A customer is classified as **At Risk** when both spending and purchasing engagement are relatively low:

```text
lowSpend AND lowFrequency
```

The term **At Risk** is used as a dashboard segment label, but it does **not** mean that the customer is predicted to churn.

DummyJSON provides no purchase dates, activity timestamps, or historical behavior needed to calculate actual churn risk.

Therefore, the application should describe this segment as:

> Customers with relatively low purchasing engagement based on the available purchase data.

---

### Standard

Customers who do not satisfy the VIP, High Value, or At Risk conditions are classified as **Standard**.

```text
Standard =
not VIP
AND not High Value
AND not At Risk
```

Standard represents the middle of the observed purchasing distribution.

---

## 8. Classification Priority

Rules must be evaluated in a fixed order to prevent overlapping classifications.

```text
1. No Purchase History
2. VIP
3. High Value
4. At Risk
5. Standard
```

Conceptually:

```text
if purchaseCount === 0
    → No Purchase History

else if highSpend && highFrequency
    → VIP

else if highSpend || highFrequency
    → High Value

else if lowSpend && lowFrequency
    → At Risk

else
    → Standard
```

`No Purchase History` is a purchase-status state rather than a segment.

---

## 9. No Purchase History

Customers with no associated cart must remain in the customer dataset.

They receive:

```text
purchaseStatus = "no-history"
segment = null
```

They must not be classified as:

* At Risk
* Standard
* High Value
* VIP

This prevents customers with no available purchase information from being treated as customers who are known to have low engagement.

---

## 10. Boundary Handling

Percentile comparisons must be deterministic.

A customer qualifies for a threshold when their metric is **greater than or equal to** the calculated threshold.

For example:

```text
totalSpend >= highSpendThreshold
```

and:

```text
totalSpend <= lowSpendThreshold
```

This ensures customers exactly on a percentile boundary are consistently classified.

---

## 11. Segmentation Inputs

The segmentation function should depend only on derived customer metrics.

Example input:

```ts
type SegmentationInput = {
  purchaseCount: number
  totalSpend: number
}
```

The segmentation function should not receive UI state, route parameters, or React components.

Example conceptual API:

```ts
getCustomerSegment(
  customer,
  thresholds
): CustomerSegment
```

The function should be:

* Pure
* Deterministic
* Independently testable
* Independent of React
* Independent of API calls

---

## 12. Separation of Concerns

Segmentation should follow this flow:

```text
DummyJSON Users + Carts
          ↓
Customer Transformation
          ↓
Customer Metrics
          ↓
Segmentation Thresholds
          ↓
Customer Segment
          ↓
UI
```

The UI should consume the resulting segment rather than calculate it itself.

For example, a component should use:

```ts
customer.segment
```

rather than independently calculating whether a customer is VIP.

---

## 13. Example

Given a customer with:

```text
purchaseCount = 3
totalSpend = 12,500
```

and thresholds:

```text
highSpend = 10,000
highFrequency = 2
```

the customer satisfies:

```text
highSpend = true
highFrequency = true
```

Therefore:

```text
segment = "VIP"
```

Another customer with:

```text
purchaseCount = 1
totalSpend = 11,000
```

satisfies:

```text
highSpend = true
highFrequency = false
```

Therefore:

```text
segment = "High Value"
```

A customer with:

```text
purchaseCount = 0
```

receives:

```text
purchaseStatus = "no-history"
segment = null
```

---

## 14. Integrity Rules

The segmentation system must:

* Use only available DummyJSON data
* Never invent purchase dates
* Never invent activity history
* Never claim to predict churn
* Never classify missing purchase data as low engagement
* Never hardcode arbitrary monetary thresholds
* Keep segmentation logic outside UI components
* Produce the same segment for the same input data
* Be covered by automated tests

---

## 15. Testing Requirements

The segmentation logic should have unit tests covering at least:

### No Purchase History

```text
purchaseCount = 0
→ segment = null
→ purchaseStatus = "no-history"
```

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

```text
not high
not low
→ Standard
```

### Boundary Values

Customers exactly equal to the calculated percentile thresholds must be tested.

### Overlapping Conditions

A customer satisfying both VIP and High Value conditions must always receive:

```text
VIP
```

---

## 16. Limitations

This segmentation model is intended for demonstrating frontend data modeling and customer analytics using the available DummyJSON dataset.

It is **not a production CRM scoring model**.

A production system would normally incorporate additional information such as:

* Purchase recency
* Purchase frequency over time
* Monetary value
* Customer lifetime value
* Product categories
* Returns
* Support interactions
* Customer activity
* Retention history

Those fields are intentionally excluded because they are not available from the selected API.

The application therefore presents segmentation as **relative purchasing behavior within the available dataset**, not as a prediction of future customer behavior.
