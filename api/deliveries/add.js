// /api/deliveries/add.js

import { Client } from 'pg';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const {
    customer,
    vendor,
    product,
    vehicle_number,
    length,
    width,
    height,
    rate,
    total_sqft,
    total_amount,
  } = req.body;

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();

    const query = `
      INSERT INTO deliveries (
        customer, vendor, product,
        vehicle_number, length, width, height,
        rate, total_sqft, total_amount
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *;
    `;

    const values = [
      customer,
      vendor,
      product,
      vehicle_number,
      length,
      width,
      height,
      rate,
      total_sqft,
      total_amount,
    ];

    const result = await client.query(query, values);

    await client.end();

    res.status(200).json({ message: 'Delivery saved', delivery: result.rows[0] });
  } catch (error) {
    console.error('Error saving delivery:', error);
    res.status(500).json({ message: 'Error saving delivery' });
  }
}
