const express = require('express');
const app = express();

// routes setup...
app.use(express.json());
app.use("/api/categories", categoryRoutes); // ✅ fixed typo
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/delivery", deliverySingle);
app.use("/api/vendors", vendorRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customersRouter);

module.exports = app;
