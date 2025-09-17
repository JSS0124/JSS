import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// Handler to GET all deliveries
export async function GET() {
  try {
    const client = await db.connect();
    const query = `
        SELECT 
            d.id, 
            d.delivery_date, 
            d.slip_number, 
            d.vehicle_number, 
            c.name as client_name, 
            p.name as product_name, 
            d.calculated_sqft,
            d.rate,
            d.total_amount
        FROM deliveries d
        JOIN clients c ON d.client_id = c.id
        JOIN products p ON d.product_id = p.id
        ORDER BY d.delivery_date DESC, d.id DESC;
    `;
    const { rows } = await client.query(query);
    client.release();
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch deliveries' }, { status: 500 });
  }
}

// Handler to POST a new delivery
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      delivery_date,
      slip_number,
      vehicle_number,
      client_id,
      vendor_id,
      product_id,
      measurement_foot,
      measurement_az,
      measurement_size,
      calculated_sqft,
      rate,
      total_amount,
    } = body;
    
    const client = await db.connect();
    await client.query(
      `INSERT INTO deliveries (delivery_date, slip_number, vehicle_number, client_id, vendor_id, product_id, measurement_foot, measurement_az, measurement_size, calculated_sqft, rate, total_amount) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [delivery_date, slip_number, vehicle_number, client_id, vendor_id, product_id, measurement_foot, measurement_az, measurement_size, calculated_sqft, rate, total_amount]
    );
    client.release();
    return NextResponse.json({ message: 'Delivery Added Successfully' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to add delivery' }, { status: 500 });
  }
}
