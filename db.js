// _db.js
import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // or other config
  ssl: { rejectUnauthorized: false } // for Neon
});
