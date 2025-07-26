const express = require("express");
const cors = require("cors");
const path = require("path");
const serverless = require("serverless-http"); // <- REQUIRED for Vercel Express

const app = express();
app.use(cors());
app.use(express.json());

// Use static public folder
app.use(express.static(path.join(__dirname, "..", "public"))); // <-- fixed path

// Import routes
const categoryRoutes = require("./categories");
const deliveryRoutes = require("./deliveries");
const deliverySingle = require("./delivery");
const vendorRoutes = require("./vendors");
const uploadRoutes = require("./uploadExcel");
const productRoutes = require("./products");
const customersRouter = require("./customers");

// Mount routes
app.use("/api/categories", categoryRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/delivery", deliverySingle);
app.use("/api/vendors", vendorRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customersRouter);

// Serve dashboard from root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "dashboard.html"));
});

// Export wrapped express app
module.exports = serverless(app);

