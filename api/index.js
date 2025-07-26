const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Static files (only works locally)
app.use(express.static(path.join(__dirname, "../public")));

// API Routes
app.use("/api/categories", require("./categories"));
app.use("/api/deliveries", require("./deliveries"));
app.use("/api/delivery", require("./delivery"));
app.use("/api/vendors", require("./vendors"));
app.use("/api/upload", require("./uploadExcel"));
app.use("/api/products", require("./products"));
app.use("/api/customers", require("./customers"));

// Health check
app.get("/", (req, res) => {
  res.send("✅ API Root Working");
});

module.exports = app;
