const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      date,
      slip_number,
      customer_id,
      vendor_id,
      product_id,
      price_level,
      vehicle_number,
      length_ft,
      width_ft,
      height_ft,
      rate,
      total_sqft,
      total_amount
    } = req.body;

    const result = await pool.query(
      `INSERT INTO deliveries
        (date, slip_number, customer_id, vendor_id, product_id, price_level,
         vehicle_number, length_ft, width_ft, height_ft, rate, total_sqft, total_amount)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        date, slip_number, customer_id, vendor_id, product_id, price_level,
        vehicle_number, length_ft, width_ft, height_ft, rate, total_sqft, total_amount
      ]
    );

    res.status(201).json({ success: true, message: "Delivery added", delivery: result.rows[0] });
  } catch (error) {
    console.error("❌ DB error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
