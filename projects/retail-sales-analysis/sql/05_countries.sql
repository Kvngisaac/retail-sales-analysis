WITH totals AS (
    SELECT country,
           SUM(CASE WHEN line_type = 'sale' THEN line_value_pence ELSE 0 END) AS gross_pence,
           -SUM(CASE WHEN line_type = 'credit' THEN line_value_pence ELSE 0 END) AS credit_pence,
           SUM(line_value_pence) AS net_pence,
           COUNT(DISTINCT CASE WHEN line_type = 'sale' THEN invoice_no END) AS sale_invoices
    FROM invoice_lines GROUP BY country
)
SELECT *, ROUND(100.0 * net_pence / NULLIF(SUM(net_pence) OVER (), 0), 2) AS net_share_pct
FROM totals ORDER BY net_pence DESC, country;
