// api/index.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const serverless = require("serverless-http");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from /public folder
app.use(express.static(path.join(__dirname, "..", "public")));

// Routes
app.use("/api/categories", require("./categories"));
app.use("/api/deliveries", require("./deliveries"));
app.use("/api/delivery", require("./delivery"));
app.use("/api/vendors", require("./vendors"));
app.use("/api/upload", require("./uploadExcel"));
app.use("/api/products", require("./products"));
app.use("/api/customers", require("./customers"));

// Fallback route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "dashboard.html"));
});

// ✅ Export for Vercel
module.exports = serverless(app);
