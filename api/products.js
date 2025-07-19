// /api/products.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// Get all products
router.get("/", async (req, res) => {
  const result = await db.query("SELECT * FROM products ORDER BY id DESC");
  res.json(result.rows);
});

// Add product
router.post("/", async (req, res) => {
  const { code, name, category, price, price1, price2, price3 } = req.body;
  const result = await db.query(
    "INSERT INTO products (code, name, category, price, price1, price2, price3) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
    [code, name, category, price, price1, price2, price3]
  );
  res.json(result.rows[0]);
});

// Delete product
router.delete("/:id", async (req, res) => {
  await db.query("DELETE FROM products WHERE id = $1", [req.params.id]);
  res.sendStatus(204);
});

module.exports = router;
