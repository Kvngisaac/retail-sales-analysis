# Retail analysis interview brief

## A 60-second explanation to adapt after reviewing the project

“This portfolio study asks which markets and products contribute the most invoice value for an online retailer. The source contains 541,909 invoice lines. The workflow preserves the original data, applies an explicit duplicate policy, retains signed credit activity, and loads the data into SQLite. SQL calculates monthly trends, country shares, and product rankings. Net invoice value is £9.75 million, with 84% from the UK. November 2011 is the strongest complete month. The results reconcile to independently calculated Python controls. The final month is incomplete, and profit cannot be measured because the dataset has no cost information. I used AI assistance for the implementation.”

Avoid saying you independently wrote every line, delivered paid client work, or increased a company's revenue. None of those claims are supported by this project.

## Numbers to understand

| Measure | Result | Meaning |
|---|---:|---|
| Original rows | 541,909 | Invoice lines, not customers or orders |
| Repeated rows removed | 5,268 | A stated policy requiring business confirmation |
| Nonpositive-price rows excluded | 2,512 | Count after duplicate handling |
| Accepted lines | 534,129 | Rows used for financial aggregates |
| Distinct sale invoices | 19,960 | Positive sale invoices after the policy |
| Positive invoice value | £10,642,110.80 | Positive priced invoice lines |
| Credit / negative-line value | £893,979.73 | Negative priced lines expressed as a positive magnitude |
| Net invoice value | £9,748,131.07 | Positive value minus negative-line value |
| UK share | 84.01% | Share of all-period net invoice value |
| Highest complete month | Nov 2011, £1,456,145.80 net | Descriptive observation, not proof of recurring seasonality |
| Duplicate sensitivity | £21,740.98 | Difference from keeping otherwise eligible repeated rows |

## Questions you should be ready to answer

**Why SQL and Python together?**
Python verifies and extracts the source workbook, handles exact decimal money calculations, and supplies independent controls. SQL defines the row policy and performs aggregation, joins, and ranking. SQLite makes the project reproducible without a database server.

**What is the data grain?**
One invoice line. An order may have several lines. Use `COUNT(DISTINCT invoice_no)` for sale invoices, not `COUNT(*)`.

**Why not delete canceled orders?**
Their negative amounts change net invoice value. Ignoring them overstates the chosen net measure. The project keeps signed credits, but does not assume they match sales in the same month or prove a cash refund.

**Why remove duplicates, and could that be wrong?**
The policy keeps the first exact repeated source-field combination. It is reproducible, but identical lines could be legitimate. The project shows the alternative total so the assumption can be evaluated.

**How does the product join avoid double-counting?**
A single deterministic description is selected per stock code. That dimension is joined after monetary values are aggregated by stock code. Its key is unique, and a cardinality check verifies the join did not add product rows.

**What do `ROW_NUMBER`, `DENSE_RANK`, and `LAG` do here?**
`ROW_NUMBER` chooses the retained duplicate and a single SKU description. `DENSE_RANK` ranks products while handling tied amounts. `LAG` retrieves the previous month's positive invoice value for comparison.

**Why use integer pence?**
Binary floating-point arithmetic can produce small monetary discrepancies. The original unit price is multiplied by quantity with `Decimal`, then rounded half up per line. Rounding the unit price first would mishandle subpenny prices.

**What about missing customer IDs?**
Keep those invoice lines in financial totals. Do not include null IDs in identified-customer counts or imply customer-level behavior can be reconstructed for them.

**What should a manager do with the findings?**
Investigate stock and fulfillment needs ahead of the observed late-year peak, monitor UK concentration, and examine the leading SKU's margins once cost data is available. These are follow-up questions. The project does not prove an intervention would work.

**How did you validate it?**
Fourteen checks reconcile source rows, policy dispositions, independent Python controls, monthly and country sums, invoice counts, product totals and join cardinality. Three boundary tests cover rounding and difficult record types. All checks pass on the pinned source snapshot.

**What would you improve with more data?**
Add costs and an approved product taxonomy, match credits to original invoices, confirm duplicate semantics with the retailer, and use several complete years before drawing seasonal conclusions.

## A five-minute review before an interview

1. Open `sql/01_model.sql` and explain the rejection-rule order.
2. Open `sql/03_monthly.sql` and explain `LAG` and the partial-month exception in `run.py`.
3. Open `sql/04_products.sql` and explain the unique dimension and the join.
4. Change the website country and full-month controls. Explain why both chart views and the KPIs update together.
5. State one finding, one assumption, and one limitation without looking at this brief.
