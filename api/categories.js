const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET all categories
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY id DESC");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("GET error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE category by ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM categories WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE error:", err);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

// POST new category
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const code = name.toLowerCase().replace(/\s+/g, "-");

    const result = await pool.query(
      "INSERT INTO categories (code, name) VALUES ($1, $2) RETURNING *",
      [code, name]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST error:", err);
    res.status(500).json({ error: "Failed to save category" });
  }
});

module.exports = router;
