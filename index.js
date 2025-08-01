const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));

// ✅ Corrected paths
const categoryRoutes = require("./api/categories");
const deliveryRoutes = require("./api/deliveries");
const deliverySingle = require("./api/delivery");
const vendorRoutes = require("./api/vendors");
const uploadRoutes = require("./api/uploadExcel");
const productRoutes = require("./api/products");
const customersRouter = require("./api/customers");

// ✅ Corrected route mounts
app.use("/categories", categoryRoutes);
app.use("/deliveries", deliveryRoutes);
app.use("/delivery", deliverySingle);
app.use("/vendors", vendorRoutes);
app.use("/upload", uploadRoutes);
app.use("/products", productRoutes);
app.use("/customers", customersRouter);

// Serve dashboard.html at root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

module.exports = app;
