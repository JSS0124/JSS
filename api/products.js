const { Pool } = require("pg");
const winston = require("winston");

// Logger setup
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: "error.log", level: "error" })],
});

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// Response format
const sendResponse = (res, status, data, error = null, message = null) => {
  res.status(status).json({ data, error, message });
};

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "https://jss-pied.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return sendResponse(res, 200, null, null, "OK");
  }

  try {
    if (req.method === "GET" && req.query.id) {
      const { id } = req.query;
      const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
      if (result.rows.length === 0) {
        return sendResponse(res, 404, null, "Product not found");
      }
      return sendResponse(res, 200, result.rows[0]);
    } else if (req.method === "GET") {
      const result = await pool.query("SELECT * FROM products ORDER BY name");
      return sendResponse(res, 200, result.rows);
    } else if (req.method === "POST") {
      const { name, category_id, description, unit, default_rate } = req.body;

      if (!name || !unit || !default_rate) {
        return sendResponse(res, 400, null, "Name, unit, and default rate are required");
      }
      if (isNaN(default_rate) || default_rate < 0) {
        return sendResponse(res, 400, null, "Invalid default rate");
      }

      const result = await pool.query(
        "INSERT INTO products (name, category_id, description, unit, default_rate) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [name, category_id, description, unit, default_rate]
      );
      return sendResponse(res, 201, result.rows[0], null, "Product created successfully");
    } else if (req.method === "PUT") {
      const { id, name, category_id, description, unit, default_rate } = req.body;

      if (!id || !name || !unit || !default_rate) {
        return sendResponse(res, 400, null, "ID, name, unit, and default rate are required");
      }
      if (isNaN(default_rate) || default_rate < 0) {
        return sendResponse(res, 400, null, "Invalid default rate");
      }

      const result = await pool.query(
        "UPDATE products SET name = $1, category_id = $2, description = $3, unit = $4, default_rate = $5 WHERE id = $6 RETURNING *",
        [name, category_id, description, unit, default_rate, id]
      );

      if (result.rows.length === 0) {
        return sendResponse(res, 404, null, "Product not found");
      }
      return sendResponse(res, 200, result.rows[0], null, "Product updated successfully");
    } else if (req.method === "DELETE") {
      const { id } = req.query;

      if (!id) {
        return sendResponse(res, 400, null, "Product ID is required");
      }

      const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING *", [id]);

      if (result.rows.length === 0) {
        return sendResponse(res, 404, null, "Product not found");
      }
      return sendResponse(res, 200, null, null, "Product deleted successfully");
    } else {
      return sendResponse(res, 405, null, "Method not allowed");
    }
  } catch (error) {
    logger.error("Database error:", error);
    return sendResponse(res, 500, null, "Internal server error");
  }
};
