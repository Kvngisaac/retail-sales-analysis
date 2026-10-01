-- Digit-leading codes are a documented proxy for merchandise. Alphabetic
-- codes such as POST, DOT, M, D and AMAZONFEE remain in overall totals.
WITH totals AS (
    SELECT stock_code,
           SUM(CASE WHEN line_type = 'sale' THEN line_value_pence ELSE 0 END) AS gross_pence,
           -SUM(CASE WHEN line_type = 'credit' THEN line_value_pence ELSE 0 END) AS credit_pence,
           SUM(line_value_pence) AS net_pence,
           SUM(CASE WHEN line_type = 'sale' THEN quantity ELSE 0 END) AS units_sold
    FROM invoice_lines WHERE merchandise_like = 1 GROUP BY stock_code
), ranked AS (
    SELECT *, DENSE_RANK() OVER (ORDER BY net_pence DESC) AS net_rank
    FROM totals
)
SELECT r.*, COALESCE(p.description, r.stock_code) AS product
FROM ranked r LEFT JOIN products p ON p.stock_code = r.stock_code
ORDER BY net_pence DESC, r.stock_code;
