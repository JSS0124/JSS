const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get all vendors
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM vendors ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("GET error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add a vendor
router.post("/", async (req, res) => {
  try {
    const { name, contact_person, contact_number, supplier_type } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const result = await pool.query(
      `INSERT INTO vendors (name, contact_person, contact_number, supplier_type)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, contact_person, contact_number, supplier_type]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST error:", err);
    res.status(500).json({ error: "Failed to save vendor" });
  }
});

// Delete vendor
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM vendors WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE error:", err);
    res.status(500).json({ error: "Failed to delete vendor" });
  }
});

module.exports = router;
