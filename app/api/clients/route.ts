// File: app/api/clients/route.ts

import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// Handler to GET all clients
export async function GET() {
  // We are adding a try...catch block here to find the error
  try {
    console.log("Attempting to connect to the database...");
    const client = await db.connect();
    console.log("Database connection successful.");

    const { rows } = await client.query('SELECT * FROM clients ORDER BY name;');
    client.release();
    console.log("Successfully fetched clients.");

    return NextResponse.json(rows);
  } catch (error) {
    // This will print the exact database error to the Vercel logs
    console.error('!!!!!!!!!! DATABASE ERROR !!!!!!!!!!!:', error);
    return NextResponse.json(
      { message: "Failed to connect to the database.", error: error },
      { status: 500 }
    );
  }
}

// NOTE: We are leaving the POST function as it was, no changes needed there.
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
