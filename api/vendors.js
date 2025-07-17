const express = require("express");
const router = express.Router();
const pool = require("../db");

// Add a new vendor
router.post("/add", async (req, res) => {
  const { name, contact } = req.body;
  try {
    await pool.query("INSERT INTO vendors (name, contact) VALUES ($1, $2)", [name, contact]);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Optionally: get all vendors
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM vendors ORDER BY name ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching vendors" });
  }
});

module.exports = router;
