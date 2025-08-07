import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send({ message: 'Only POST requests allowed' });
  }

  try {
    const {
      slip_number,
      vehicle_number,
      customer_id,
      vendor_id,
      product_id,
      length_ft,
      width_ft,
      height_ft,
      rate,
      total_sqft,
      total_amount,
      notes,
      date
    } = req.body;

    const result = await sql`
      INSERT INTO deliveries (
        slip_number, vehicle_number, customer_id, vendor_id, product_id,
        length_ft, width_ft, height_ft, rate, total_sqft, total_amount, notes, date
      )
      VALUES (
        ${slip_number}, ${vehicle_number}, ${customer_id}, ${vendor_id}, ${product_id},
        ${length_ft}, ${width_ft}, ${height_ft}, ${rate}, ${total_sqft}, ${total_amount}, ${notes}, ${date}
      )
      RETURNING *;
    `;

    res.status(200).json({ message: "Delivery saved", delivery: result.rows[0] });
  } catch (error) {
    console.error("❌ Insert error:", error);
    res.status(500).json({ error: "Database insert failed", details: error.message });
  }
}
