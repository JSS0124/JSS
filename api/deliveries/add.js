const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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
      length_ft,
      width_ft,
      height_ft,
      total_sqft,
      rate,
      total_amount,
      vehicle_number
    } = req.body;

    const result = await pool.query(
      `INSERT INTO deliveries
       (date, slip_number, customer_id, vendor_id, product_id,
        length_ft, width_ft, height_ft, total_sqft, rate, total_amount, vehicle_number)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        date, slip_number, customer_id, vendor_id, product_id,
        length_ft, width_ft, height_ft, total_sqft, rate, total_amount, vehicle_number
      ]
    );

    res.status(200).json({ success: true, delivery: result.rows[0] });
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
