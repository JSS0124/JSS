const express = require("express");
const router = express.Router();
const pool = require("../db"); // Assuming db.js exports your PostgreSQL pool

// Get all products
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching products:", err.message);
    res.status(500).send("Server Error");
  }
});

// Add a product
router.post("/", async (req, res) => {
  try {
    const { name, category_id, price } = req.body;
    const result = await pool.query(
      "INSERT INTO products (name, category_id, price) VALUES ($1, $2, $3) RETURNING *",
      [name, category_id, price]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error adding product:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
