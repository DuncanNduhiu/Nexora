from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3

from database import get_db_connection, init_db


app = Flask(__name__)
CORS(app)

init_db()


def product_to_dict(product):
    return dict(product)


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "success",
        "message": "Nexora API is running"
    }), 200


@app.route("/api/products", methods=["GET"])
def get_products():
    connection = get_db_connection()

    try:
        products = connection.execute("""
            SELECT *
            FROM products
            ORDER BY id DESC
        """).fetchall()

        return jsonify([product_to_dict(product) for product in products]), 200

    finally:
        connection.close()


@app.route("/api/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    connection = get_db_connection()

    try:
        product = connection.execute(
            "SELECT * FROM products WHERE id = ?",
            (product_id,)
        ).fetchone()

        if product is None:
            return jsonify({"error": "Product not found"}), 404

        return jsonify(product_to_dict(product)), 200

    finally:
        connection.close()


@app.route("/api/products", methods=["POST"])
def create_product():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "A JSON object is required"}), 400

    required_fields = [
        "name",
        "sku",
        "category",
        "cost_price",
        "selling_price",
        "quantity",
    ]

    missing_fields = [
        field for field in required_fields
        if field not in data or data[field] is None or data[field] == ""
    ]

    if missing_fields:
        return jsonify({
            "error": "Missing required fields",
            "fields": missing_fields
        }), 400

    name = data["name"]
    sku = data["sku"]
    category = data["category"]

    if not all(isinstance(value, str) and value.strip()
               for value in (name, sku, category)):
        return jsonify({
            "error": "Name, SKU, and category must be non-empty strings"
        }), 400

    numeric_fields = [
        "cost_price",
        "selling_price",
        "quantity",
        "low_stock_threshold",
    ]

    values = {}

    for field in numeric_fields:
        value = data.get(field, 5 if field == "low_stock_threshold" else None)

        if (
            isinstance(value, bool)
            or not isinstance(value, int)
            or value < 0
        ):
            return jsonify({
                "error": f"{field} must be a non-negative integer"
            }), 400

        values[field] = value

    connection = get_db_connection()

    try:
        cursor = connection.execute("""
            INSERT INTO products (
                name,
                sku,
                category,
                cost_price,
                selling_price,
                quantity,
                low_stock_threshold
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            name.strip(),
            sku.strip(),
            category.strip(),
            values["cost_price"],
            values["selling_price"],
            values["quantity"],
            values["low_stock_threshold"],
        ))

        connection.commit()

        product = connection.execute(
            "SELECT * FROM products WHERE id = ?",
            (cursor.lastrowid,)
        ).fetchone()

        return jsonify(product_to_dict(product)), 201

    except sqlite3.IntegrityError:
        connection.rollback()

        return jsonify({
            "error": "A product with this SKU already exists"
        }), 409

    finally:
        connection.close()


@app.route("/api/products/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "A JSON object is required"}), 400

    required_fields = [
        "name",
        "sku",
        "category",
        "cost_price",
        "selling_price",
        "quantity",
        "low_stock_threshold",
    ]

    missing_fields = [
        field for field in required_fields
        if field not in data or data[field] is None or data[field] == ""
    ]

    if missing_fields:
        return jsonify({
            "error": "Missing required fields",
            "fields": missing_fields
        }), 400

    if not all(
        isinstance(data[field], str) and data[field].strip()
        for field in ("name", "sku", "category")
    ):
        return jsonify({
            "error": "Name, SKU, and category must be non-empty strings"
        }), 400

    for field in (
        "cost_price",
        "selling_price",
        "quantity",
        "low_stock_threshold",
    ):
        value = data[field]

        if (
            isinstance(value, bool)
            or not isinstance(value, int)
            or value < 0
        ):
            return jsonify({
                "error": f"{field} must be a non-negative integer"
            }), 400

    connection = get_db_connection()

    try:
        existing = connection.execute(
            "SELECT id FROM products WHERE id = ?",
            (product_id,)
        ).fetchone()

        if existing is None:
            return jsonify({"error": "Product not found"}), 404

        connection.execute("""
            UPDATE products
            SET name = ?,
                sku = ?,
                category = ?,
                cost_price = ?,
                selling_price = ?,
                quantity = ?,
                low_stock_threshold = ?
            WHERE id = ?
        """, (
            data["name"].strip(),
            data["sku"].strip(),
            data["category"].strip(),
            data["cost_price"],
            data["selling_price"],
            data["quantity"],
            data["low_stock_threshold"],
            product_id,
        ))

        connection.commit()

        product = connection.execute(
            "SELECT * FROM products WHERE id = ?",
            (product_id,)
        ).fetchone()

        return jsonify(product_to_dict(product)), 200

    except sqlite3.IntegrityError:
        connection.rollback()

        return jsonify({
            "error": "A product with this SKU already exists"
        }), 409

    finally:
        connection.close()


@app.route("/api/products/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    connection = get_db_connection()

    try:
        cursor = connection.execute(
            "DELETE FROM products WHERE id = ?",
            (product_id,)
        )

        if cursor.rowcount == 0:
            return jsonify({"error": "Product not found"}), 404

        connection.commit()

        return jsonify({
            "message": "Product deleted successfully"
        }), 200

    finally:
        connection.close()


if __name__ == "__main__":
    app.run(debug=True, port=5000)
