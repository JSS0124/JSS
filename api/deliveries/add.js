import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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
    } = req.body;

    const query = `
      INSERT INTO deliveries (
        customer, vendor, product, vehicle_number,
        length, width, height, rate, total_sqft, total_amount
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *;
    `;

    const values = [
      customer, vendor, product, vehicleNumber,
      length, width, height, rate, totalSqft, totalAmount
    ];

    const result = await pool.query(query, values);

    res.status(200).json({ message: 'Delivery saved', delivery: result.rows[0] });
  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
