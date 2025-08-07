// File: api/deliveries/add.js

import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
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
      date,
    } = req.body;

    await sql`
      INSERT INTO deliveries (customer, vendor, product, vehicle_number, length, width, height, rate, total_sqft, total_amount, date)
      VALUES (${customer}, ${vendor}, ${product}, ${vehicleNumber}, ${length}, ${width}, ${height}, ${rate}, ${totalSqft}, ${totalAmount}, ${date})
    `;

    return res.status(200).json({ message: 'Delivery saved successfully' });
  } catch (error) {
    console.error('Error saving delivery:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
