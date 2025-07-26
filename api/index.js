const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));

// API Routes
const categoryRoutes = require("./categories");
const deliveryRoutes = require("./deliveries");
const deliverySingle = require("./delivery");
const vendorRoutes = require("./vendors");
const uploadRoutes = require("./uploadExcel");
const productRoutes = require("./products");
const customersRouter = require("./customers");

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
