// /api/products.js
const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get all products with category name
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.name, c.name AS category, p.price, p.price1, p.price2, p.price3
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

    if (!name || !category_id) {
      return res.status(400).json({ error: "Name and Category are required" });
    }

    const result = await pool.query(
      `INSERT INTO products (name, category_id, price, price1, price2, price3)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, category_id, price, price1, price2, price3]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST error:", err);
    res.status(500).json({ error: "Failed to save product" });
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
