import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST allowed' });
  }

  try {
    const delivery = req.body;

    const result = await pool.query(
      `INSERT INTO deliveries (customer, vendor, product, vehicle_number, length, width, height, rate, total_sqft, total_amount)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        delivery.customer,
        delivery.vendor,
        delivery.product,
        delivery.vehicle_number,
        delivery.length,
        delivery.width,
        delivery.height,
        delivery.rate,
        delivery.total_amount // or total_sqft
      ]
    );

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('❌ DB Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}
