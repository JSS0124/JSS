import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    customer_id,
    vendor_id,
    product_id,
    vehicle_number,
    length,
    width,
    height,
    rate,
    total_sqft,
    total_amount,
    slip_number,
  } = req.body;

  try {
    await sql`
      INSERT INTO deliveries 
        (customer_id, vendor_id, product_id, vehicle_number, length, width, height, rate, total_sqft, total_amount, slip_number) 
      VALUES 
        (${customer_id}, ${vendor_id}, ${product_id}, ${vehicle_number}, ${length}, ${width}, ${height}, ${rate}, ${total_sqft}, ${total_amount}, ${slip_number});
    `;

    return res.status(200).json({ message: 'Delivery added successfully' });
  } catch (error) {
    console.error('❌ DB insert error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
