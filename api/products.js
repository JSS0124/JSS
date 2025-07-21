const express = require("express");
const router = express.Router();
const pool = require("../db");

// ✅ Add new product
router.post("/", async (req, res) => {
  const { name, category_id, price, price1, price2, price3 } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO products (name, category_id, price, price1, price2, price3)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, category_id, price, price1, price2, price3]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ error: "Failed to add product" });
  }
});

// ✅ Delete product
router.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM products WHERE id = $1", [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
