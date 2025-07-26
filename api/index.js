const express = require("express");
const cors = require("cors");
const path = require("path");

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Static files (optional, works only in dev/local)
app.use(express.static(path.join(__dirname, "../public")));

// API Routes
app.use("/api/categories", require("./categories"));
app.use("/api/deliveries", require("./deliveries"));
app.use("/api/delivery", require("./delivery"));
app.use("/api/vendors", require("./vendors"));
app.use("/api/upload", require("./uploadExcel"));
app.use("/api/products", require("./products"));
app.use("/api/customers", require("./customers"));

// Default Route (optional for homepage)
app.get("/", (req, res) => {
  res.send("API Root Working ✅");
});

// Export as Vercel serverless handler
module.exports = app;
