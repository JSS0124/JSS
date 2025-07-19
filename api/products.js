const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get all products with category name
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const code = "CAT" + Date.now();
    await pool.query("INSERT INTO categories (code, name) VALUES ($1, $2)", [code, name]);
    res.status(201).json({ message: "Category added" });
  } catch (error) {
    console.error("Error saving category:", error); // 👈 this helps
    res.status(500).json({ error: "Internal server error" });
  }
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
