const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get all customers
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM customers ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching customers:", err.message);
    res.status(500).send("Server Error");
  }
});

// Add a customer
router.post("/", async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const result = await pool.query(
      "INSERT INTO customers (name, phone, address) VALUES ($1, $2, $3) RETURNING *",
      [name, phone, address]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error adding customer:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

