import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const data = req.body;  // All fields from the form
    console.log('Received delivery:', data);

    // Example DB insert — adjust according to your schema
    await sql`
      INSERT INTO deliveries (
        slip_number, vehicle_number, customer_id, vendor_id, product_id,
        length_ft, width_ft, height_ft, rate, total_sqft, total_amount, notes, date
      ) VALUES (
        ${data.slip_number}, ${data.vehicle_number}, ${data.customer_id}, ${data.vendor_id}, ${data.product_id},
        ${data.length_ft}, ${data.width_ft}, ${data.height_ft}, ${data.rate}, ${data.total_sqft}, ${data.total_amount},
        ${data.notes || ''}, ${data.date}
      )
    `;

    return res.status(200).json({ success: true, message: 'Delivery saved' });
  } catch (error) {
    console.error('DB error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
