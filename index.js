const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));

// API Routes
const categoryRoutes = require("./api/categories.js");
const deliveryRoutes = require("./api/deliveries.js");
const deliverySingle = require("./api/delivery.js");
const vendorRoutes = require("./api/vendors.js");
const uploadRoutes = require("./api/uploadExcel.js");
const productRoutes = require("./api/products.js");
const customersRouter = require("./api/customers.js");

app.use("/api/categories.js", categoryRoutes); // ✅ fixed typo
app.use("/api/deliveries.js", deliveryRoutes);
app.use("/api/delivery.js", deliverySingle);
app.use("/api/vendors.js", vendorRoutes);
app.use("/api/upload.js", uploadRoutes);
app.use("/api/products.js", productRoutes);
app.use("/api/customers.js", customersRouter);

// Serve dashboard.html at root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

module.exports = app;
