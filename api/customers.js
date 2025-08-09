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
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return sendResponse(res, 200, null, null, "OK");
  }

  try {
    if (req.method === "GET") {
      const result = await pool.query("SELECT * FROM customers ORDER BY name");
      sendResponse(res, 200, result.rows);
    } else if (req.method === "POST") {
      const { name, contact_person, contact_number, client_type, address, price_level } = req.body;

      if (!name) {
        return sendResponse(res, 400, null, "Customer name is required");
      }

      const result = await pool.query(
        "INSERT INTO customers (name, contact_person, contact_number, client_type, address, price_level) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [name, contact_person, contact_number, client_type, address, price_level]
      );
      sendResponse(res, 201, result.rows[0], null, "Customer created successfully");
    } else if (req.method === "PUT") {
      const { id, name, contact_person, contact_number, client_type, address, price_level } = req.body;

      if (!id || !name) {
        return sendResponse(res, 400, null, "ID and name are required");
      }

      const result = await pool.query(
        "UPDATE customers SET name = $1, contact_person = $2, contact_number = $3, client_type = $4, address = $5, price_level = $6 WHERE id = $7 RETURNING *",
        [name, contact_person, contact_number, client_type, address, price_level, id]
      );

      if (result.rows.length === 0) {
        return sendResponse(res, 404, null, "Customer not found");
      }
      sendResponse(res, 200, result.rows[0], null, "Customer updated successfully");
    } else if (req.method === "DELETE") {
      const { id } = req.query;

      if (!id) {
        return sendResponse(res, 400, null, "Customer ID is required");
      }

      const result = await pool.query("DELETE FROM customers WHERE id = $1 RETURNING *", [id]);

      if (result.rows.length === 0) {
        return sendResponse(res, 404, null, "Customer not found");
      }
      sendResponse(res, 200, null, null, "Customer deleted successfully");
    } else {
      sendResponse(res, 405, null, "Method not allowed");
    }
  } catch (error) {
    logger.error("Database error:", error);
    sendResponse(res, 500, null, "Internal server error");
  }
};
