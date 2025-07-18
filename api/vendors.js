const express = require("express");
const router = express.Router();
const pool = require("../db"); // assuming db.js exports your PostgreSQL pool

// GET all vendors
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM vendors");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Vendor Route Error:", err); // ADD THIS LINE
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
