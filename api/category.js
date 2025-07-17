const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// Add a new category
router.post('/add', async (req, res) => {
  const { name } = req.body;
  try {
    await pool.query('INSERT INTO categories (name) VALUES ($1)', [name]);
    res.status(201).json({ message: 'Category added' });
  } catch (err) {
    res.status(500).json({ message: 'Error adding category' });
  }
});

module.exports = router;
