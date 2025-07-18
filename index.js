const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const categoryRoutes = require("./api/category");
const deliveryRoutes = require("./api/deliveries");
const deliverySingle = require("./api/delivery");
const vendorRoutes = require("./api/vendors");
const uploadRoutes = require("./api/uploadExcel");

app.use("/api/categories", categoryRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/delivery", deliverySingle);
app.use("/api/vendors", vendorRoutes);
app.use("/api/upload", uploadRoutes);

module.exports = app;
