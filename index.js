const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const http = require('http');
require("dotenv").config();

const authRoutes = require("./src/routes/auth.route");
const eventApiRoutes = require("./src/routes/eventApi.routes");
const userRoutes = require("./src/routes/user.routes");
const eventCategoryRoutes = require("./src/routes/eventCategory.route");
const directoryRoutes = require("./src/routes/directory.routes");
const agendaRoures = require("./src/routes/agenda.route");
const galleryRoutes = require("./src/routes/gallery.routes"); 
const groupRoutes = require("./src/routes/group.routes");
const publicationItemRoutes = require("./src/routes/publication.routes"); 
const publicationGroupsRoutes = require("./src/routes/publictionGroup.routes"); 
const collaboratorRoutes = require("./src/routes/collaborator.routes");
const emailTemplateRoutes = require("./src/routes/emailTemplate.routes"); 
const contactRoutes = require("./src/routes/importdata.routes")
const engageRoutes = require("./src/routes/engage.routes");
const vanueMapRoutes = require("./src/routes/venueMap.routes")
const newsRoute = require("./src/routes/news.routes");
const mobileRoutes = require("./src/routes/mobile.routes");
const { initializeSocket } = require('./src/socket');
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO only if not in serverless environment
if (process.env.NODE_ENV !== "production") {
  initializeSocket(server);
} else {
  // For Vercel, we'll initialize socket in a different way
  app.use('/socket.io', (req, res) => {
    res.status(200).send('Socket.IO endpoint');
  });
}

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/events", eventApiRoutes);
app.use("/api/category", eventCategoryRoutes);
app.use("/api/directory", directoryRoutes);
app.use("/api/agenda", agendaRoures);
app.use("/api/gallery", galleryRoutes);  
app.use("/api/group", groupRoutes); 
app.use('/api/publicationItem',publicationItemRoutes); 
app.use("/api/publicationGroup",publicationGroupsRoutes)
app.use("/api/collaborator",collaboratorRoutes); 
app.use("/api/emailTemplate",emailTemplateRoutes)
app.use("/api/importData", contactRoutes);
app.use("/api/engage", engageRoutes);
app.use("/api/venueMap", vanueMapRoutes)
app.use("/api/news", newsRoute)
app.use("/api/mobile", mobileRoutes)

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running #21" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  });
});

// Only start the server if we're not in a serverless environment
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`🚀 Server is live at: http://localhost:${PORT}
    🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

// Export for Vercel
module.exports = app;
