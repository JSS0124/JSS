const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../public"))); // ✅ fix path

// Your routes
app.use("/api/categories", categoryRoutes); // ✅ fixed typo
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

module.exports = app;
