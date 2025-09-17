import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// Handler to GET all clients
export async function GET() {
  try {
    const client = await db.connect();
    const { rows } = await client.query('SELECT * FROM clients ORDER BY name;');
    client.release();
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

// Handler to POST a new client
export async function POST(request: Request) {
  try {
    const { name, contact_person, phone, address, type, price_level } = await request.json();
    const client = await db.connect();
    await client.query(
      'INSERT INTO clients (name, contact_person, phone, address, type, price_level) VALUES ($1, $2, $3, $4, $5, $6)',
      [name, contact_person, phone, address, type, price_level]
    );
    client.release();
    return NextResponse.json({ message: 'Client Added Successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add client' }, { status: 500 });
  }
}
