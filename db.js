const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.status(200).json({ time: result.rows[0].now });
  } catch (error) {
    console.error("❌ ERROR:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
