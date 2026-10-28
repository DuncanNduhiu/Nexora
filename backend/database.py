import sqlite3
from pathlib import Path

DATABASE_PATH = Path(__file__).parent / "nexora.db"


def get_db_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def init_db():
    connection = get_db_connection()

    try:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                sku TEXT NOT NULL UNIQUE,
                category TEXT NOT NULL,
                cost_price INTEGER NOT NULL CHECK(cost_price >= 0),
                selling_price INTEGER NOT NULL CHECK(selling_price >= 0),
                quantity INTEGER NOT NULL DEFAULT 0 CHECK(quantity >= 0),
                low_stock_threshold INTEGER NOT NULL DEFAULT 5
                    CHECK(low_stock_threshold >= 0),
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)

        connection.commit()

    finally:
        connection.close()
