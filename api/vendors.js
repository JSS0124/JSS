// POST /api/vendors
app.post('/api/vendors', async (req, res) => {
  const { name, contact } = req.body;
  try {
    await pool.query('INSERT INTO vendors (name, contact) VALUES ($1, $2)', [name, contact]);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/categories
app.post('/api/categories', async (req, res) => {
  const { name } = req.body;
  try {
    await pool.query('INSERT INTO categories (name) VALUES ($1)', [name]);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

