const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
  try {
    console.log("✅ /api/vendors route hit"); // Debug log
    const result = await pool.query("SELECT * FROM vendors");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error in /api/vendors:", err); // Capture exact error
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
