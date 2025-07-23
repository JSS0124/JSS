const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/categories", require("./api/categories"));
app.use("/api/deliveries", require("./api/deliveries"));
app.use("/api/delivery", require("./api/delivery"));
app.use("/api/vendors", require("./api/vendors"));
app.use("/api/upload", require("./api/uploadExcel"));
app.use("/api/products", require("./api/products"));
app.use("/api/customers", require("./api/customers"));

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

module.exports = app; // ✅ required for Vercel
