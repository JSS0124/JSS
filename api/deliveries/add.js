// File: api/deliveries/add.js

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const {
      customer,
      vendor,
      product,
      vehicle_no,
      length,
      width,
      height,
      rate,
      total_sqft,
      total_amount,
    } = req.body;

    const query = `
      INSERT INTO deliveries (
        customer, vendor, product, vehicle_no,
        length, width, height, rate,
        total_sqft, total_amount
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      customer,
      vendor,
      product,
      vehicle_no,
      length,
      width,
      height,
      rate,
      total_sqft,
      total_amount,
    ];

    const result = await pool.query(query, values);
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('DB Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
