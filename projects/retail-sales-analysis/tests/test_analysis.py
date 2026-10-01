"""Meaningful boundary tests for the cleaning contract and money calculation."""
import sqlite3
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from run import pence, identifier, ROOT


class AnalysisTests(unittest.TestCase):
    def test_line_rounding_preserves_subpenny_unit_prices(self):
        self.assertEqual(pence(2500, 0.001), 250)
        self.assertEqual(pence(1, 0.025), 3)
        self.assertEqual(pence(-1, 0.025), -3)

    def test_identifiers_preserve_codes_and_missing_values(self):
        self.assertEqual(identifier(12345.0), "12345")
        self.assertEqual(identifier("00012"), "00012")
        self.assertIsNone(identifier(None))

    def test_duplicates_credits_and_anomalies_have_distinct_treatment(self):
        db = sqlite3.connect(":memory:")
        db.execute("""CREATE TABLE raw_lines (source_row INTEGER, invoice_no TEXT,
            stock_code TEXT, description TEXT, quantity INTEGER, invoice_date TEXT,
            unit_price TEXT, customer_id TEXT, country TEXT, line_value_pence INTEGER,
            date_valid INTEGER)""")
        base = ("100", "00123", "ITEM", 2, "2011-01-01 10:00:00", "3.0", None, "UK", 600, 1)
        rows = [(1, *base), (2, *base),
                (3, "C100", "00123", "ITEM", -1, "2011-01-02 10:00:00", "3.0", None, "UK", -300, 1),
                (4, "101", "00123", "ITEM", 1, "2011-01-02 10:00:00", "0", None, "UK", 0, 1),
                (5, "C102", "00123", "ITEM", 1, "2011-01-02 10:00:00", "3.0", None, "UK", 300, 1),
                (6, "103", "00123", "ITEM", -1, "2011-01-02 10:00:00", "3.0", None, "UK", -300, 1)]
        db.executemany("INSERT INTO raw_lines VALUES (?,?,?,?,?,?,?,?,?,?,?)", rows)
        db.executescript((ROOT / "sql" / "01_model.sql").read_text())
        dispositions = dict(db.execute("SELECT disposition, COUNT(*) FROM classified_lines GROUP BY disposition"))
        self.assertEqual(dispositions, {"accepted": 3, "duplicate": 1, "nonpositive_price": 1, "positive_cancellation": 1})
        self.assertEqual(db.execute("SELECT SUM(line_value_pence) FROM invoice_lines").fetchone()[0], 0)
        self.assertEqual(db.execute("SELECT COUNT(*) FROM invoice_lines WHERE customer_id IS NULL").fetchone()[0], 3)
        self.assertEqual(db.execute("SELECT COUNT(*) FROM invoice_lines WHERE line_type='credit'").fetchone()[0], 2)
        db.close()


if __name__ == "__main__":
    unittest.main()
