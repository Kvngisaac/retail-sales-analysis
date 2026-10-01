-- Compare gross invoice value by calendar month. The final month is partial.
WITH monthly AS (
    SELECT month, COUNT(*) AS invoice_lines,
           SUM(CASE WHEN line_type = 'sale' THEN line_value_pence ELSE 0 END) AS gross_pence,
           -SUM(CASE WHEN line_type = 'credit' THEN line_value_pence ELSE 0 END) AS credit_pence,
           SUM(line_value_pence) AS net_pence,
           COUNT(DISTINCT CASE WHEN line_type = 'sale' THEN invoice_no END) AS sale_invoices
    FROM invoice_lines GROUP BY month
), compared AS (
    SELECT *, LAG(gross_pence) OVER (ORDER BY month) AS previous_gross_pence
    FROM monthly
)
SELECT *, CASE WHEN previous_gross_pence > 0
    THEN ROUND(100.0 * (gross_pence - previous_gross_pence) / previous_gross_pence, 2)
    ELSE NULL END AS gross_month_change_pct
FROM compared ORDER BY month;
