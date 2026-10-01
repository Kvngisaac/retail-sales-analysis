# Retail performance dashboard

The visualization layer of Justin Pierite’s retail SQL case study. This is a second artifact from the same UCI dataset, developed with AI assistance. It is a JavaScript web dashboard; it does not claim Power BI or Excel work.

## Use the dashboard

Open `index.html` in a modern browser. The downloadable package includes the generated data and all local scripts/styles. No sign-in or database service is needed to use the downloaded files. The hosted portfolio retains its private access policy.

Choose a country, start month, end month, chart measure, and optional full-month-only setting. KPIs, monthly values, and full SKU rankings update together. Select a monthly bar to inspect that month. Reset restores the entire dataset. Export CSV downloads the exact selected report, including clearly labeled market-context rows.

**Market context** deliberately compares all countries for the chosen period, while the selected country is highlighted. That scope is stated beside the chart and in exported records. Product ranking uses all eligible SKUs in the chosen country and period, rather than a preselected overall top-20 pool. The report shows the top ten for the selected measure.

## Architecture and metrics

SQL produces 314 country/month aggregates and 66,939 merchandise-like SKU/country/month aggregates. Compact integer indexes refer to dictionaries of 38 countries, 13 months, and 3,914 SKU labels. Integer pence preserve exact monetary totals. The dashboard derives net value as positive value less credit/negative-line magnitude.

Overall totals include postage and manual charges. Product rankings use digit-leading stock codes as a documented merchandise proxy, so their totals need not match the overall total. Credits are not matched to the originating sales, and no cash-refund, recognized-revenue, profit, or causal-business-impact claim is made. The source ends on 9 December 2011. That partial month is visibly marked and can be excluded.

An empty range after excluding the partial month shows unavailable KPIs and disables export. A valid month range with no recorded country activity shows zero and states that no activity is recorded. Changing an endpoint beyond the other endpoint adjusts the paired control to keep the range valid.

CSV output includes the country/period scope, exact GBP values, a selected-total row, selected-month rows, all-country market context, and the top ten products for the chosen measure. Text fields are escaped and potential spreadsheet formulas are prefixed with an apostrophe. Numeric amounts remain numeric.

## Reproduce the data model

The exporter is intended for the full portfolio source tree. Run the related `projects/retail-sales-analysis/run.py` first, then `python projects/retail-dashboard/export_data.py`. It reads the verified SQLite database, checks the original analysis validation, reconciles the full product and country/month aggregates, and updates `dist/dashboard/data.js` plus the provenance manifest. A copy of the generated dashboard is included in the package for immediate review.

`dashboard-core.js` contains pure filter, aggregation, ranking, and CSV functions. `dashboard.js` binds those functions to semantic controls and exact-value tables. No external fonts, libraries, data calls, or analytics are required by the dashboard.

The base analysis passes 14 data checks and three boundary tests. Dashboard tests compare 258 filter views and 24 full SKU ranking views with independently generated SQLite controls. Run `node tests/dashboard-core.test.cjs` in the downloaded package, or `node projects/retail-dashboard/tests/dashboard-core.test.cjs` in the full source tree. To refresh the controls after a deliberate source change, run `python projects/retail-dashboard/tests/build_sql_controls.py` in the full tree. Browser visual/native keyboard QA is unavailable in this environment; semantic controls and DOM event behavior are checked separately.

## Source and attribution

Chen, D. (2015). Online Retail [Dataset]. UCI Machine Learning Repository. https://doi.org/10.24432/C5BW33. Source: https://archive.ics.uci.edu/dataset/352/online+retail. License: CC BY 4.0, https://creativecommons.org/licenses/by/4.0/. Cleaning, aggregation, and filtering modify the original data. `data-manifest.json` records source hashes, dictionaries, row counts, and control checks.
