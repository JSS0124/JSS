const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../public"))); // ✅ fix path

// Your routes
app.use("/api/categories", require("./categories"));
app.use("/api/deliveries", require("./deliveries"));
app.use("/api/delivery", require("./delivery"));
app.use("/api/vendors", require("./vendors"));
app.use("/api/upload", require("./uploadExcel"));
app.use("/api/products", require("./products"));
app.use("/api/customers", require("./customers"));

// Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "dashboard.html"));
});

module.exports = app;
