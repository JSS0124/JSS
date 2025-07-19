const pool = require("../db");

module.exports = async (req, res) => {
  if (req.method === "POST") {
    const { name } = req.body;

    if (!name) {
      return res.status(400).send("Category name is required");
    }

    try {
      const result = await pool.query(
        "INSERT INTO categories (name) VALUES ($1) RETURNING *",
        [name]
      );
      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error("DB Insert Error:", err);
      return res.status(500).send("Failed to save category");
    }
  }

  if (req.method === "GET") {
    try {
      const result = await pool.query("SELECT * FROM categories ORDER BY id DESC");
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error("DB Fetch Error:", err);
      return res.status(500).send("Failed to fetch categories");
    }
  }

  return res.status(405).send("Method Not Allowed");
};
