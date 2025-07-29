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
      // Get all deliveries
      const result = await pool.query('SELECT * FROM deliveries ORDER BY date DESC, id DESC');
      res.status(200).json(result.rows);
    } else if (req.method === 'POST') {
      // Create new delivery
      const {
        slip_number,
        date,
        customer_id,
        customer_name,
        vendor_id,
        vendor_name,
        product_id,
        product_name,
        length_ft,
        width_ft,
        total_sqft,
        rate,
        total_amount,
        notes
      } = req.body;

      const result = await pool.query(
        `INSERT INTO deliveries 
         (slip_number, date, customer_id, customer_name, vendor_id, vendor_name, 
          product_id, product_name, length_ft, width_ft, total_sqft, rate, total_amount, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
         RETURNING *`,
        [slip_number, date, customer_id, customer_name, vendor_id, vendor_name,
         product_id, product_name, length_ft, width_ft, total_sqft, rate, total_amount, notes]
      );

      res.status(201).json(result.rows[0]);
    } else if (req.method === 'PUT') {
      // Update delivery
      const {
        id,
        slip_number,
        date,
        customer_id,
        customer_name,
        vendor_id,
        vendor_name,
        product_id,
        product_name,
        length_ft,
        width_ft,
        total_sqft,
        rate,
        total_amount,
        notes
      } = req.body;

      const result = await pool.query(
        `UPDATE deliveries SET 
         slip_number = $1, date = $2, customer_id = $3, customer_name = $4, 
         vendor_id = $5, vendor_name = $6, product_id = $7, product_name = $8,
         length_ft = $9, width_ft = $10, total_sqft = $11, rate = $12, 
         total_amount = $13, notes = $14, updated_at = CURRENT_TIMESTAMP
         WHERE id = $15 RETURNING *`,
        [slip_number, date, customer_id, customer_name, vendor_id, vendor_name,
         product_id, product_name, length_ft, width_ft, total_sqft, rate, total_amount, notes, id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Delivery not found' });
      } else {
        res.status(200).json(result.rows[0]);
      }
    } else if (req.method === 'DELETE') {
      // Delete delivery
      const { id } = req.query;
      
      const result = await pool.query('DELETE FROM deliveries WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Delivery not found' });
      } else {
        res.status(200).json({ message: 'Delivery deleted successfully' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

