const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Get all products
      const result = await pool.query('SELECT * FROM products ORDER BY name');
      res.status(200).json(result.rows);
    } else if (req.method === 'POST') {
      // Create new product
      const { name, description, unit, default_rate } = req.body;
      
      const result = await pool.query(
        'INSERT INTO products (name, description, unit, default_rate) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, description, unit, default_rate]
      );
      
      res.status(201).json(result.rows[0]);
    } else if (req.method === 'PUT') {
      // Update product
      const { id, name, description, unit, default_rate } = req.body;
      
      const result = await pool.query(
        'UPDATE products SET name = $1, description = $2, unit = $3, default_rate = $4 WHERE id = $5 RETURNING *',
        [name, description, unit, default_rate, id]
      );
      
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Product not found' });
      } else {
        res.status(200).json(result.rows[0]);
      }
    } else if (req.method === 'DELETE') {
      // Delete product
      const { id } = req.query;
      
      const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Product not found' });
      } else {
        res.status(200).json({ message: 'Product deleted successfully' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
