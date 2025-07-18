const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // ✅ from Neon
  ssl: {
    rejectUnauthorized: false, // required for Neon SSL
  },
});

module.exports = pool;
