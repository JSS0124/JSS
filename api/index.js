const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
const categoryRoutes = require("./api/categories");
const deliveryRoutes = require("./api/deliveries");
const deliverySingle = require("./api/delivery");
const vendorRoutes = require("./api/vendors");
const uploadRoutes = require("./api/uploadExcel");
const productRoutes = require("./api/products");
const customersRouter = require("./api/customers");

app.use("/api/categories", categoryRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/delivery", deliverySingle);
app.use("/api/vendors", vendorRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customersRouter);

// Serve dashboard
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// ✅ Key fix: Export a handler for Vercel serverless
module.exports = app;
