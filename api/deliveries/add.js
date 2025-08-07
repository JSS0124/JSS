// /api/deliveries/add.js

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // for Neon
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;

    const {
      customer,
      vendor,
      product,
      vehicleNumber,
      length,
      width,
      height,
      rate,
      totalSqft,
      totalAmount,
    } = data;

    const query = `
      INSERT INTO deliveries (
        customer, vendor, product, vehicle_number,
        length, width, height, rate, total_sqft, total_amount
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    `;

    await pool.query(query, [
      customer, vendor, product, vehicleNumber,
      length, width, height, rate, totalSqft, totalAmount
    ]);

    res.status(200).json({ success: true, message: 'Delivery saved' });

  } catch (err) {
    console.error('❌ DB Error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
}
