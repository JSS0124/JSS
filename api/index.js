const express = require("express");
const cors = require("cors");
const path = require("path");
const serverless = require("serverless-http"); // ✅ important

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, "../public"))); // ✅ fix path

// Routes
const categoryRoutes = require("./categories");
const deliveryRoutes = require("./deliveries");
const deliverySingle = require("./delivery");
const vendorRoutes = require("./vendors");
const uploadRoutes = require("./uploadExcel");
const productRoutes = require("./products");
const customersRouter = require("./customers");

app.use("/api/categories", categoryRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/delivery", deliverySingle);
app.use("/api/vendors", vendorRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customersRouter);

// Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "dashboard.html"));
});

// Export handler for Vercel
module.exports = serverless(app); // ✅ use serverless-http
