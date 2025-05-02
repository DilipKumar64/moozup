const express = require("express");
require("dotenv").config();
const authRoutes = require("./src/routes/authRoutes");
const eventApiRoutes = require("./src/routes/eventApiRoutes");

const app = express();
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/events", eventApiRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server is live at: http://localhost:${process.env.PORT}
  🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});
