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
      const result = await pool.query("SELECT * FROM vendors WHERE id = $1", [id]);
      if (result.rows.length === 0) {
        return sendResponse(res, 404, null, "Vendor not found");
      }
      return sendResponse(res, 200, result.rows[0]);
    } else if (req.method === "GET") {
      const result = await pool.query("SELECT * FROM vendors ORDER BY name");
      return sendResponse(res, 200, result.rows);
    } else if (req.method === "POST") {
      const { name, contact_person, phone, email, address, gst_number } = req.body;

      if (!name) {
        return sendResponse(res, 400, null, "Vendor name is required");
      }
      if (phone && !/\+?\d{10,12}/.test(phone)) {
        return sendResponse(res, 400, null, "Invalid phone number");
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return sendResponse(res, 400, null, "Invalid email address");
      }

      const result = await pool.query(
        "INSERT INTO vendors (name, contact_person, phone, email, address, gst_number) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [name, contact_person, phone, email, address, gst_number]
      );
      return sendResponse(res, 201, result.rows[0], null, "Vendor created successfully");
    } else if (req.method === "PUT") {
      const { id, name, contact_person, phone, email, address, gst_number } = req.body;

      if (!id || !name) {
        return sendResponse(res, 400, null, "ID and name are required");
      }
      if (phone && !/\+?\d{10,12}/.test(phone)) {
        return sendResponse(res, 400, null, "Invalid phone number");
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return sendResponse(res, 400, null, "Invalid email address");
      }

      const result = await pool.query(
        "UPDATE vendors SET name = $1, contact_person = $2, phone = $3, email = $4, address = $5, gst_number = $6 WHERE id = $7 RETURNING *",
        [name, contact_person, phone, email, address, gst_number, id]
      );

      if (result.rows.length === 0) {
        return sendResponse(res, 404, null, "Vendor not found");
      }
      return sendResponse(res, 200, result.rows[0], null, "Vendor updated successfully");
    } else if (req.method === "DELETE") {
      const { id } = req.query;

      if (!id) {
        return sendResponse(res, 400, null, "Vendor ID is required");
      }

      const result = await pool.query("DELETE FROM vendors WHERE id = $1 RETURNING *", [id]);

      if (result.rows.length === 0) {
        return sendResponse(res, 404, null, "Vendor not found");
      }
      return sendResponse(res, 200, null, null, "Vendor deleted successfully");
    } else {
      return sendResponse(res, 405, null, "Method not allowed");
    }
  } catch (error) {
    logger.error("Database error:", error);
    return sendResponse(res, 500, null, "Internal server error");
  }
};
