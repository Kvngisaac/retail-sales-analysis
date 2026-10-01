-- Dispositions are mutually exclusive; they reconcile to the original rows.
SELECT disposition, COUNT(*) AS rows, SUM(line_value_pence) AS signed_pence
FROM classified_lines GROUP BY disposition ORDER BY disposition;
