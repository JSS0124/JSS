const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET all categories
router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM categories ORDER BY id ASC");
  res.json(result.rows);
});

// POST new category
router.post("/", async (req, res) => {
  const { name } = req.body;
  const result = await pool.query(
    "INSERT INTO categories (name) VALUES ($1) RETURNING *",
    [name]
  );
  res.json(result.rows[0]);
});

// DELETE category
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM categories WHERE id = $1", [id]);
  res.json({ success: true });
});

module.exports = router;
