const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));

// API Routes
const categoryRoutes = require("./api/categories");
const deliveryRoutes = require("./api/deliveries");
const deliverySingle = require("./api/delivery");
const vendorRoutes = require("./api/vendors");
const uploadRoutes = require("./api/uploadExcel");
const productRoutes = require("./api/products");

app.use("/api/categories", categoryRoutes); // ✅ fixed typo
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/delivery", deliverySingle);
app.use("/api/vendors", vendorRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/products", productRoutes);

// Serve dashboard.html at root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

module.exports = app;
