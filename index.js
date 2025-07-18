const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const categoryRoutes = require("./api/category");
const deliveryRoutes = require("./api/deliveries");
const deliverySingle = require("./api/delivery");
const vendorRoutes = require("./api/vendors");
const uploadRoutes = require("./api/uploadexcel");

// Mount routes
app.use("/api/categories", require("./api/category"));
app.use("/api/deliveries", require("./api/deliveries"));
app.use("/api/delivery", require("./api/delivery"));
app.use("/api/vendors", require("./api/vendors"));
app.use("/api/upload", require("./api/uploadexcel"));

// Export for Vercel
module.exports = app;
