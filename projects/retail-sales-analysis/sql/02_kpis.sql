SELECT COUNT(*) AS accepted_lines,
       SUM(CASE WHEN line_type = 'sale' THEN line_value_pence ELSE 0 END) AS gross_pence,
       -SUM(CASE WHEN line_type = 'credit' THEN line_value_pence ELSE 0 END) AS credit_pence,
       SUM(line_value_pence) AS net_pence,
       COUNT(DISTINCT CASE WHEN line_type = 'sale' THEN invoice_no END) AS sale_invoices,
       COUNT(DISTINCT customer_id) AS identified_customers,
       SUM(CASE WHEN customer_id IS NULL THEN 1 ELSE 0 END) AS missing_customer_lines,
       MIN(invoice_date) AS start_at, MAX(invoice_date) AS end_at
FROM invoice_lines;
