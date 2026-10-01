"""Build independent SQLite controls for dashboard filters and full SKU ranks."""
import json
import sqlite3
from pathlib import Path

BASE = Path(__file__).resolve().parents[3]
data = json.loads((BASE / "projects/retail-sales-analysis/results/analysis.json").read_text())
countries = sorted(row["country"] for row in data["countries"])
connection = sqlite3.connect(BASE / "projects/retail-sales-analysis/data/derived/retail.sqlite")
connection.row_factory = sqlite3.Row
months = [row["month"] for row in data["monthly"]]
cases = []
for country in ["all"] + countries:
    for complete in [False, True]:
        cases.append((country, 0, 12, complete, False))
# Include mid-period windows, single months, credits, and the partial-only empty state.
for country, start, end, complete in [
    ("all", 3, 6, False), ("Germany", 5, 8, False),
    ("United Kingdom", 10, 11, True), ("France", 0, 0, False),
    ("USA", 12, 12, False), ("all", 12, 12, True),
    ("Japan", 1, 5, False), ("all", 11, 12, False)
]:
    cases.append((country, start, end, complete, True))
controls = []
for country, start, end, complete, check_products in cases:
    eligible = [m for i, m in enumerate(months) if start <= i <= end
                and (not complete or not data["monthly"][i]["partial"])]
    placeholders = ",".join("?" for _ in eligible) or "NULL"
    where = f"WHERE (?='all' OR i.country=?) AND i.month IN ({placeholders})"
    args = [country, country, *eligible]
    totals = dict(connection.execute(f"""
        SELECT SUM(i.line_value_pence) AS net,
               SUM(CASE WHEN i.line_type='sale' THEN i.line_value_pence ELSE 0 END) AS gross,
               -SUM(CASE WHEN i.line_type='credit' THEN i.line_value_pence ELSE 0 END) AS credits,
               COUNT(DISTINCT CASE WHEN i.line_type='sale' THEN i.invoice_no END) AS invoices
        FROM invoice_lines i {where}
    """, args).fetchone())
    row = {"state": {"country": "all" if country == "all" else str(countries.index(country)),
                     "start": start, "end": end, "completeOnly": complete},
           "totals": {key: value or 0 for key, value in totals.items()},
           "eligibleMonths": len(eligible)}
    if check_products:
        rankings = {}
        for measure in ["net", "gross", "credits"]:
            rankings[measure] = [dict(item) for item in connection.execute(f"""
                WITH selected AS (
                    SELECT i.stock_code AS sku,
                           SUM(i.line_value_pence) AS net,
                           SUM(CASE WHEN i.line_type='sale' THEN i.line_value_pence ELSE 0 END) AS gross,
                           -SUM(CASE WHEN i.line_type='credit' THEN i.line_value_pence ELSE 0 END) AS credits
                    FROM invoice_lines i {where} AND i.merchandise_like=1
                    GROUP BY i.stock_code
                ) SELECT * FROM selected WHERE {measure} != 0
                ORDER BY {measure} DESC, sku LIMIT 10
            """, args)]
        row["products"] = rankings
    controls.append(row)
target = Path(__file__).parent / "sql-controls.json"
target.write_text(json.dumps(controls, indent=2))
print("Saved", len(controls), "independent SQL filter controls.")
