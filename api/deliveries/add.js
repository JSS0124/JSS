import { pool } from '../../_db'; // adjust path if your _db.js is elsewhere

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const {
    customer_id,
    vendor_id,
    product_id,
    vehicle_no,
    slip_no,
    length,
    width,
    height,
    rate,
    total_sqft,
    total_amount
  } = req.body;

  try {
    const query = `
      INSERT INTO deliveries 
      (customer_id, vendor_id, product_id, vehicle_no, slip_no, length, width, height, rate, total_sqft, total_amount)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING id
    `;
    const values = [
      customer_id, vendor_id, product_id,
      vehicle_no, slip_no,
      length, width, height, rate,
      total_sqft, total_amount
    ];

    const result = await pool.query(query, values);
    res.status(200).json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error('Error saving delivery:', err);
    res.status(500).json({ error: 'Failed to save delivery' });
  }
}
