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
      // Get all deliveries with related data
      const result = await pool.query(`
        SELECT d.*, 
               c.name AS customer_name, 
               v.name AS vendor_name, 
               p.name AS product_name
        FROM deliveries d
        LEFT JOIN customers c ON d.customer_id = c.id
        LEFT JOIN vendors v ON d.vendor_id = v.id
        LEFT JOIN products p ON d.product_id = p.id
        ORDER BY d.date DESC, d.id DESC
      `);
      res.status(200).json(result.rows);
    } else if (req.method === 'POST') {
      // Create new delivery
      const {
        date,
        slip_number,
        customer_id,
        vehicle_number,
        product_id,
        vendor_id,
        foot,
        az,
        size,
        total_sqft,
        rate,
        total_amount,
        price_level,
        remarks
      } = req.body;

      // Get customer, vendor, and product names
      const customerResult = await pool.query('SELECT name FROM customers WHERE id = $1', [customer_id]);
      const vendorResult = await pool.query('SELECT name FROM vendors WHERE id = $1', [vendor_id]);
      const productResult = await pool.query('SELECT name FROM products WHERE id = $1', [product_id]);

      const customer_name = customerResult.rows[0]?.name || '';
      const vendor_name = vendorResult.rows[0]?.name || '';
      const product_name = productResult.rows[0]?.name || '';

      const result = await pool.query(`
        INSERT INTO deliveries (
          date, slip_number, customer_id, customer_name, vehicle_number, vendor_id, vendor_name,
          product_id, product_name, length_ft, width_ft, height_ft, total_sqft, rate, total_amount, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `, [
        date,
        slip_number,
        customer_id,
        customer_name,
        vehicle_number,
        vendor_id,
        vendor_name,
        product_id,
        product_name,
        foot, // Using foot as length_ft
        az,   // Using az as width_ft
        size, // Using size as height_ft
        total_sqft,
        rate,
        total_amount,
        remarks || ''
      ]);

      res.status(201).json({ success: true, data: result.rows[0] });tal_sqft,
        rate,
        total_amount,
        remarks || "",'
      ]);

      res.status(201).json({ success: true, data: result.rows[0] });
    } else if (req.method === 'DELETE') {
      // Delete delivery
      const { id } = req.query;
      
      const result = await pool.query('DELETE FROM deliveries WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Delivery not found' });
      } else {
        res.status(200).json({ success: true, message: 'Delivery deleted successfully' });
      }
    } else if (req.method === 'PUT') {
      // Update delivery
      const { id } = req.query;
      const {
        date,
        slip_number,
        customer_id,
        vehicle_number,
        product_id,
        vendor_id,
        foot,
        az,
        size,
        total_sqft,
        rate,
        total_amount,
        price_level,
        remarks
      } = req.body;

      // Get customer, vendor, and product names
      const customerResult = await pool.query('SELECT name FROM customers WHERE id = $1', [customer_id]);
      const vendorResult = await pool.query('SELECT name FROM vendors WHERE id = $1', [vendor_id]);
      const productResult = await pool.query('SELECT name FROM products WHERE id = $1', [product_id]);

      const customer_name = customerResult.rows[0]?.name || '';
      const vendor_name = vendorResult.rows[0]?.name || '';
      const product_name = productResult.rows[0]?.name || '';

      const result = await pool.query(`
        UPDATE deliveries SET
          date = $1,
          slip_number = $2,
          customer_id = $3,
          customer_name = $4,
          vendor_id = $5,
          vendor_name = $6,
          product_id = $7,
          product_name = $8,
          length_ft = $9,
          width_ft = $10,
          total_sqft = $11,
          rate = $12,
          total_amount = $13,
          notes = $14,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $15
        RETURNING *
      `, [
        date,
        slip_number,
        customer_id,
        customer_name,
        vendor_id,
        vendor_name,
        product_id,
        product_name,
        foot, // Using foot as length_ft
        az,   // Using az as width_ft
        total_sqft,
        rate,
        total_amount,
        remarks || '',
        id
      ]);

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Delivery not found' });
      } else {
        res.status(200).json({ success: true, data: result.rows[0] });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
