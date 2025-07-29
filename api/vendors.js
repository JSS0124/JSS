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
      // Get all vendors
      const result = await pool.query('SELECT * FROM vendors ORDER BY name');
      res.status(200).json(result.rows);
    } else if (req.method === 'POST') {
      // Create new vendor
      const { name, contact_person, phone, email, address, gst_number } = req.body;
      
      const result = await pool.query(
        'INSERT INTO vendors (name, contact_person, phone, email, address, gst_number) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [name, contact_person, phone, email, address, gst_number]
      );
      
      res.status(201).json(result.rows[0]);
    } else if (req.method === 'PUT') {
      // Update vendor
      const { id, name, contact_person, phone, email, address, gst_number } = req.body;
      
      const result = await pool.query(
        'UPDATE vendors SET name = $1, contact_person = $2, phone = $3, email = $4, address = $5, gst_number = $6 WHERE id = $7 RETURNING *',
        [name, contact_person, phone, email, address, gst_number, id]
      );
      
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Vendor not found' });
      } else {
        res.status(200).json(result.rows[0]);
      }
    } else if (req.method === 'DELETE') {
      // Delete vendor
      const { id } = req.query;
      
      const result = await pool.query('DELETE FROM vendors WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Vendor not found' });
      } else {
        res.status(200).json({ message: 'Vendor deleted successfully' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

