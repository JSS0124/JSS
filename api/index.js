const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../public"))); // ✅ fix path

// Your routes
app.use("/categories", categoryRoutes);
app.use("/deliveries", deliveryRoutes);
app.use("/delivery", deliverySingle);
app.use("/vendors", vendorRoutes);
app.use("/upload", uploadRoutes);
app.use("/products", productRoutes);
app.use("/customers", customersRouter);

// Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "dashboard.html"));
});

module.exports = app;
