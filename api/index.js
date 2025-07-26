const express = require('express');
const app = express();

app.use(express.json());

// ✅ Import your route modules here
const categoryRoutes = require('./categories');
const deliveryRoutes = require('./deliveries');
const deliverySingle = require('./delivery');
const vendorRoutes = require('./vendors');
const uploadRoutes = require('./uploadExcel');
const productRoutes = require('./products');
const customersRouter = require('./customers');

// ✅ Attach routes
app.use("/api/categories", categoryRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/delivery", deliverySingle);
app.use("/api/vendors", vendorRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customersRouter);

module.exports = app;
