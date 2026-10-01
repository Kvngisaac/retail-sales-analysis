-- Original rows remain intact. A row is one invoice line, not one order.
DROP TABLE IF EXISTS classified_lines;
CREATE TABLE classified_lines AS
WITH ranked AS (
    SELECT *, ROW_NUMBER() OVER (
        PARTITION BY invoice_no, stock_code, description, quantity,
                     invoice_date, unit_price, customer_id, country
        ORDER BY source_row
    ) AS duplicate_rank
    FROM raw_lines
)
SELECT *, CASE
    WHEN duplicate_rank > 1 THEN 'duplicate'
    WHEN date_valid = 0 THEN 'invalid_date'
    WHEN CAST(unit_price AS REAL) <= 0 THEN 'nonpositive_price'
    WHEN quantity = 0 THEN 'zero_quantity'
    WHEN UPPER(invoice_no) LIKE 'C%' AND quantity > 0 THEN 'positive_cancellation'
    ELSE 'accepted'
END AS disposition
FROM ranked;

DROP TABLE IF EXISTS invoice_lines;
CREATE TABLE invoice_lines AS
SELECT source_row, invoice_no, stock_code, description, quantity,
       invoice_date, unit_price, customer_id, country, line_value_pence,
       CASE WHEN quantity < 0 THEN 'credit' ELSE 'sale' END AS line_type,
       CASE WHEN UPPER(invoice_no) LIKE 'C%' THEN 1 ELSE 0 END AS is_cancellation,
       SUBSTR(invoice_date, 1, 7) AS month,
       CASE WHEN stock_code GLOB '[0-9]*' THEN 1 ELSE 0 END AS merchandise_like
FROM classified_lines WHERE disposition = 'accepted';
CREATE INDEX invoice_lines_month ON invoice_lines(month);
CREATE INDEX invoice_lines_country ON invoice_lines(country);
CREATE INDEX invoice_lines_product ON invoice_lines(stock_code);

-- A SKU may have several descriptions. Choose its most common nonblank
-- label deterministically, with the latest date and text as tie breakers.
DROP TABLE IF EXISTS products;
CREATE TABLE products AS
WITH labels AS (
    SELECT stock_code, description, COUNT(*) AS uses, MAX(invoice_date) AS latest
    FROM invoice_lines WHERE description IS NOT NULL
    GROUP BY stock_code, description
), ranked AS (
    SELECT *, ROW_NUMBER() OVER (
        PARTITION BY stock_code ORDER BY uses DESC, latest DESC, description
    ) AS label_rank FROM labels
)
SELECT stock_code, description FROM ranked WHERE label_rank = 1;
CREATE UNIQUE INDEX products_key ON products(stock_code);
