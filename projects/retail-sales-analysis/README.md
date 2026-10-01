# Retail sales analysis

A reproducible SQL portfolio study prepared for Justin Pierite, with AI-assisted implementation. It uses historical public data to investigate monthly patterns, country concentration, and merchandise-like product rankings. This is a portfolio study, not paid employer work. No commercial intervention or causal business impact is claimed.

## Questions and verified findings

Which markets and products contribute the most net invoice value? What changes after accounting for credits, exact repeated rows, and incomplete periods?

- Original source: 541,909 invoice lines, 1 December 2010 to 9 December 2011.
- Accepted after the stated policy: 534,129 lines and 19,960 sale invoices.
- Positive invoice value: **£10,642,110.80**.
- Credit / negative-line value: **£893,979.73**.
- Net invoice value: **£9,748,131.07**.
- UK share of net invoice value: **84.01%**.
- Highest complete month: November 2011, **£1,456,145.80** net.
- Highest net merchandise-like SKU: REGENCY CAKESTAND 3 TIER (22423), **£164,459.49** net.

These figures are invoice-line values, including postage and manual charges in the overall totals. They do not establish recognized accounting revenue, profit, customer lifetime value, or present-day market behavior.

## Reproduce the analysis

Use Python 3.11 or newer. SQLite is part of Python; no database service or credentials are required. Run commands from this project folder.

```bash
python -m venv .venv
```

Activate the environment on Windows:

```powershell
.venv\Scripts\Activate.ps1
```

Or on macOS/Linux:

```bash
source .venv/bin/activate
```

Then:

```bash
python -m pip install -r requirements.txt
python run.py
python -m unittest discover -s tests -v
```

If environment activation is restricted, call the environment's Python directly, such as `.venv\Scripts\python.exe run.py` on Windows, after installing requirements with that interpreter.

`run.py` downloads the original UCI archive, verifies its SHA-256 checksum, extracts the source workbook, and verifies the workbook checksum. An existing original workbook may be supplied with `python run.py --input "path/to/Online Retail.xlsx"`. The checksums prevent an unnoticed source change from silently altering the published result. A deliberate source change requires a provenance review and updates to both checksums.

The run creates an inspectable SQLite database in `data/derived/retail.sqlite`. Results appear in `results/analysis.json`, full product/month/country CSV summaries, and `results/validation.json`. Raw data and the database are ignored by Git. The download contains verified summary outputs, so those can be reviewed immediately. No workbook is modified.

## Metric and modeling decisions

1. **Grain:** each source row is an invoice line. Distinct positive sale invoice numbers count orders; row counts do not.
2. **Raw preservation:** original workbook bytes and loaded rows remain intact. `source_row` traces an accepted record to its workbook row.
3. **Duplicates:** keep the first exact repeated combination of the eight normalized source fields. SQL uses `ROW_NUMBER`. Remove 5,268 repeated rows. This is a stated analysis policy; identical repeated lines could represent legitimate activity.
4. **Excluded anomalies:** after duplicate handling, exclude 2,512 nonpositive-price rows. Invalid dates, zero quantities, and positive quantities on cancellation-coded invoices also have explicit rejection rules. Those extra categories have zero rows in this source snapshot.
5. **Credits:** retain negative-quantity lines with positive prices. Cancellation-coded and other negative lines are credit/adjustment activity, not positive sales. Do not match them to an original sale or assume each is a cash refund.
6. **Missing customers:** retain rows with missing IDs in invoice-value totals. The original source has 135,080 missing customer IDs. After the policy, 132,565 accepted lines still lack IDs. They cannot support identified-customer metrics.
7. **Money:** extend the original unit price by quantity, then round half up to integer pence per line. Do not round subpenny unit prices before multiplication. Totals sum signed integer amounts.
8. **Products:** choose the most frequent nonblank description per SKU, with deterministic tie breakers. Join that single-row dimension to SKU-level aggregation to prevent fanout. Digit-leading codes are only a proxy for merchandise; alphabetic charge/adjustment codes remain in overall totals.
9. **Time:** the observed period ends on 9 December 2011. Mark that month partial and suppress its month-over-month growth figure. The dashboard offers a full-month-only view.
10. **Interactive product scope:** the website ranks within the overall top 20 merchandise-like SKUs when filters change. It does not pretend to show the unrestricted top products for each country. `results/products.csv` includes the complete overall SKU ranking.

## Sensitivity and validation

Keeping otherwise eligible repeated rows gives **£9,769,872.05** net invoice value, **£21,740.98** above the chosen total. Confirm the duplicate policy with business stakeholders before applying it to an operational report.

Fourteen checks validate row-count and disposition reconciliation, independent Python accepted-line and monetary totals, gross less credits, monthly/country/country-month sums, invoice counts across country-month groups, every product total, join cardinality, and partial-month treatment. They fail the run on disagreement. The independent Python controls are calculated during extraction, separately from SQL deduplication and aggregation. Three boundary tests cover subpenny rounding, identifiers, duplicates, canceled orders, negative adjustments, nonpositive prices, and missing customer IDs.

## Project files

- `run.py`: provenance verification, extraction, execution, and independent controls.
- `sql/01_model.sql`: raw-to-accepted classification and a deterministic product dimension.
- `sql/02_kpis.sql`: signed invoice metrics and distinct invoice/customer counts.
- `sql/03_monthly.sql`: monthly aggregation and `LAG` comparison.
- `sql/04_products.sql`: SKU aggregation, dimension join, and `DENSE_RANK`.
- `sql/05_countries.sql`: country totals and share using a window aggregate.
- `sql/06_quality.sql`: disjoint disposition counts.
- `tests/test_analysis.py`: boundary tests.
- `INTERVIEW_BRIEF.md`: short explanation, likely questions, and limitations to discuss.
- `results/`: verified outputs.

## Source and licensing

Chen, D. (2015). *Online Retail* [Dataset]. UCI Machine Learning Repository. DOI: https://doi.org/10.24432/C5BW33. Source: https://archive.ics.uci.edu/dataset/352/online+retail. Dataset license: Creative Commons Attribution 4.0 International, https://creativecommons.org/licenses/by/4.0/. Cleaning, filtering, and aggregation are modifications to the original dataset. The code license below does not replace the dataset license.

Code and explanatory materials were generated with AI assistance for this portfolio. Review the implementation and its limitations before presenting the work in an interview.
