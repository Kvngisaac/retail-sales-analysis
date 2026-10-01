"""Export the full retail dashboard model from the existing verified SQL study.

Run from this repository after projects/retail-sales-analysis/run.py completes.
The dashboard package also includes the generated data.js for immediate use.
"""
import gzip
import hashlib
import json
import sqlite3
from pathlib import Path

BASE = Path(__file__).resolve().parents[2]
source = BASE / "projects/retail-sales-analysis/results/analysis.json"
study = json.loads(source.read_text())
assert study["validation"]["passed"]
connection = sqlite3.connect(BASE / "projects/retail-sales-analysis/data/derived/retail.sqlite")
connection.row_factory = sqlite3.Row
countries = sorted(row["country"] for row in study["countries"])
country_ids = {name: index for index, name in enumerate(countries)}
months = [{"month": row["month"], "partial": row["partial"]} for row in study["monthly"]]
month_ids = {row["month"]: index for index, row in enumerate(months)}
products = list(connection.execute("""
    SELECT DISTINCT i.stock_code, COALESCE(p.description, i.stock_code) AS product
    FROM invoice_lines i LEFT JOIN products p ON i.stock_code = p.stock_code
    WHERE i.merchandise_like = 1 ORDER BY i.stock_code
"""))
skus = [[row["stock_code"], row["product"]] for row in products]
sku_ids = {row[0]: index for index, row in enumerate(skus)}
segments = []
for row in connection.execute("""
    SELECT country, month, stock_code,
           SUM(CASE WHEN line_type = 'sale' THEN line_value_pence ELSE 0 END) AS gross_pence,
           -SUM(CASE WHEN line_type = 'credit' THEN line_value_pence ELSE 0 END) AS credit_pence
    FROM invoice_lines WHERE merchandise_like = 1
    GROUP BY country, month, stock_code ORDER BY month, country, stock_code
"""):
    segments.append([month_ids[row["month"]], country_ids[row["country"]],
                     sku_ids[row["stock_code"]], row["gross_pence"], row["credit_pence"]])
country_month = [[month_ids[row["month"]], country_ids[row["country"]], row["gross_pence"],
                  row["credit_pence"], row["sale_invoices"]] for row in study["country_month"]]
product_control = connection.execute("SELECT SUM(line_value_pence) FROM invoice_lines WHERE merchandise_like=1").fetchone()[0]
assert sum(row[3] - row[4] for row in segments) == product_control
assert sum(row[2] - row[3] for row in country_month) == study["kpis"]["net_pence"]
data = {
    "version": 1, "source": study["source"],
    "source_analysis_sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
    "countries": countries, "months": months, "skus": skus,
    "country_month": country_month, "product_segments": segments,
    "validation": {"base_checks": study["validation"]["check_count"],
                   "country_month_reconciles": True, "complete_product_segments_reconcile": True},
    "column_definitions": {
        "country_month": ["month_index", "country_index", "gross_pence", "credit_pence", "sale_invoices"],
        "product_segments": ["month_index", "country_index", "sku_index", "gross_pence", "credit_pence"]
    }
}
compact = json.dumps(data, separators=(",", ":"), ensure_ascii=False)
destination = BASE / "dist/dashboard"
destination.mkdir(parents=True, exist_ok=True)
(destination / "data.js").write_text("window.DASHBOARD_DATA=" + compact + ";\n", encoding="utf-8")
(Path(__file__).parent / "data-manifest.json").write_text(json.dumps({
    "source": data["source"], "source_analysis_sha256": data["source_analysis_sha256"],
    "countries": len(countries), "months": len(months), "skus": len(skus),
    "product_country_month_segments": len(segments), "validation": data["validation"],
    "data_bytes": len(compact.encode()), "gzip_bytes": len(gzip.compress(compact.encode()))
}, indent=2))
print("Exported", len(segments), "complete product/country/month segments.")
