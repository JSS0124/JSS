const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get all products with category name
router.get("/", async (req, res) => {
  const result = await pool.query(`
    SELECT p.*, c.name AS category_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    ORDER BY p.id ASC
  `);
  res.json(result.rows);
});

// Add new product
router.post("/", async (req, res) => {
  const { name, category_id, price, price1, price2, price3 } = req.body;
  const result = await pool.query(
    `INSERT INTO products (name, category_id, price, price1, price2, price3)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [name, category_id, price, price1, price2, price3]
  );
  res.json(result.rows[0]);
});

// Delete product
router.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM products WHERE id = $1", [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
