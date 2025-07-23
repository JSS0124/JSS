// /api/customers.js
const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get all customers
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM customers ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("GET error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add new customer
router.post("/", async (req, res) => {
  try {
    const { name, contact_person, contact_number, client_type, address, price_level } = req.body;
    if (!name || !client_type || !price_level) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    const result = await pool.query(
      `INSERT INTO customers (name, contact_person, contact_number, client_type, address, price_level)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, contact_person, contact_number, client_type, address, price_level]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST error:", err);
    res.status(500).json({ error: "Failed to save customer" });
  }
});

// Update customer
router.put("/:id", async (req, res) => {
  try {
    const { name, contact_person, contact_number, client_type, address, price_level } = req.body;
    const result = await pool.query(
      `UPDATE customers SET name=$1, contact_person=$2, contact_number=$3, client_type=$4, address=$5, price_level=$6
       WHERE id=$7 RETURNING *`,
      [name, contact_person, contact_number, client_type, address, price_level, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT error:", err);
    res.status(500).json({ error: "Failed to update customer" });
  }
});

// Delete customer
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM customers WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE error:", err);
    res.status(500).json({ error: "Failed to delete customer" });
  }
});

module.exports = router;
