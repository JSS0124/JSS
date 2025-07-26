// /api/products.js
const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get all products with category name
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.name, c.name AS category, p.category_id,
             p.price, p.price1, p.price2, p.price3
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("GET error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add new product
router.post("/", async (req, res) => {
  try {
    const { name, category_id, price, price1, price2, price3 } = req.body;

    if (!name || !category_id || !price) {
      return res
        .status(400)
        .json({ error: "Name, category, and base price are required" });
    }

    const result = await pool.query(
      `INSERT INTO products (name, category_id, price, price1, price2, price3)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        name,
        category_id,
        price,
        price1 || null,
        price2 || null,
        price3 || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error saving product:", error);
    res.status(500).json({ error: "Failed to save product" });
  }
});

// Update product
router.put("/:id", async (req, res) => {
  try {
    const { name, category_id, price, price1, price2, price3 } = req.body;

    if (!name || !category_id || !price) {
      return res
        .status(400)
        .json({ error: "Name, category, and base price are required" });
    }

    const result = await pool.query(
      `UPDATE products
       SET name = $1,
           category_id = $2,
           price = $3,
           price1 = $4,
           price2 = $5,
           price3 = $6
       WHERE id = $7
       RETURNING *`,
      [
        name,
        category_id,
        price,
        price1 || null,
        price2 || null,
        price3 || null,
        req.params.id,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT error:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// Delete product
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM products WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE error:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

module.exports = router;
