import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const {
      customer_id,
      vendor_id,
      product_id,
      vehicle_number,
      slip_number,
      length,
      width,
      height,
      rate,
      total_sqft,
      total_amount
    } = req.body;

    const result = await db.query(
      `INSERT INTO deliveries (
        customer_id, vendor_id, product_id,
        vehicle_number, slip_number,
        length, width, height, rate,
        total_sqft, total_amount
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [
        customer_id, vendor_id, product_id,
        vehicle_number, slip_number,
        length, width, height, rate,
        total_sqft, total_amount
      ]
    );

    return res.status(200).json({ message: 'Delivery saved', delivery: result.rows[0] });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
