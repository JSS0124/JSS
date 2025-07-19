const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET all products
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// POST new product
router.post("/", async (req, res) => {
  try {
    const { name, category, price, price1, price2, price3 } = req.body;
    const result = await pool.query(
      `INSERT INTO products (name, category, price, price1, price2, price3)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, category, price, price1, price2, price3]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// DELETE product
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM products WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
