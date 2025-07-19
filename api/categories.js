const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get all categories
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add a new category
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const code = "CAT" + Date.now(); // Example: CAT162333888
    await pool.query("INSERT INTO categories (code, name) VALUES ($1, $2)", [code, name]);

    res.status(201).json({ message: "Category added successfully" });
  } catch (error) {
    console.error("Error saving category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
