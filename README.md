# Retail invoice analysis and interactive dashboard

A reproducible portfolio case study by Justin Pierite, developed with AI assistance. SQL investigates invoice value, country concentration, credits, product rankings, and monthly patterns. A JavaScript dashboard lets reviewers explore the same verified study by country, month range, and measure, with exact-value tables and CSV export.

This is one case study with two artifacts. The data is historical public UCI Online Retail data, not employer work. The report makes no profit, accounting-revenue, causal-impact, or commercial-engagement claim.

The [source repository](https://github.com/Kvngisaac/retail-sales-analysis) is private. Reviewers need separate GitHub access.

## Review the evidence

- [SQL study and policies](projects/retail-sales-analysis/README.md)
- [Verified analysis results](projects/retail-sales-analysis/results/analysis.json)
- [SQL interview brief](projects/retail-sales-analysis/INTERVIEW_BRIEF.md)
- [Dashboard implementation](dist/dashboard/)
- [Dashboard definitions and architecture](projects/retail-dashboard/README.md)
- [Dashboard interview brief](projects/retail-dashboard/INTERVIEW_BRIEF.md)
- [Verification scope and remaining gaps](VERIFICATION.md)

The [hosted portfolio](https://justin-pierite-data-work.kvngisaa.chatgpt.site) and [dashboard](https://justin-pierite-data-work.kvngisaa.chatgpt.site/dashboard/) currently use private access. Repository access and hosted-site access are separate.

## Verified findings

The original workbook contains 541,909 invoice lines. After the documented duplicate and nonpositive-price policies, 534,129 lines remain. Positive invoice value is £10,642,110.80, credit/negative-line value is £893,979.73, and net invoice value is £9,748,131.07 across 19,960 sale invoices. November 2011 is the highest complete month, with £1,456,145.80 net invoice value. The final month ends on 9 December and is partial.

See the SQL study for the exact row policies, duplicate sensitivity, source attribution, and limits. These findings and their underlying code are preserved in this release.

## Run and reproduce

Use Python 3.11 or newer and Node.js. From the repository root:

The unchanged project was reproduced with Python 3.12.3 and SQLite 3.45.1. SQLite 3.53.1 produced file-backed database errors in this workspace; that runtime compatibility is unresolved. See the verification report before choosing a runtime.

```bash
python -m pip install -r projects/retail-sales-analysis/requirements.txt
python projects/retail-sales-analysis/run.py
python -m unittest discover -s projects/retail-sales-analysis/tests -v
python projects/retail-dashboard/export_data.py
python projects/retail-dashboard/tests/build_sql_controls.py
node projects/retail-dashboard/tests/dashboard-core.test.cjs
```

The analysis downloads the pinned UCI archive and validates its SHA-256 hash. If the original workbook is already available, use `python projects/retail-sales-analysis/run.py --input "path/to/Online Retail.xlsx"` instead. The dashboard exporter and test-control generator use the resulting SQLite database. Raw files and the generated database are ignored by Git and excluded from this release.

Open `dist/dashboard/index.html` to inspect the self-contained dashboard, or serve `dist` with a static server. No external browser libraries, data calls, or fonts are needed. The standalone dashboard's portfolio links return to the private hosted site.

## Source and license

Chen, D. (2015). Online Retail [Dataset]. UCI Machine Learning Repository. https://doi.org/10.24432/C5BW33. Dataset license: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Cleaning, aggregation, and filtering modify the source data. Code and explanatory materials use the included MIT license; it does not replace the dataset license.
