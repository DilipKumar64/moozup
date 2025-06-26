const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const http = require('http');
require("dotenv").config();

const authRoutes = require("./src/auth/routes/auth.route");
const eventApiRoutes = require("./src/event/routes/eventApi.routes");
const userRoutes = require("./src/user/routes/user.routes");
const eventCategoryRoutes = require("./src/event/routes/eventCategory.route");
const directoryRoutes = require("./src/event/routes/directory.routes");
const agendaRoures = require("./src/event/routes/agenda.route");
const galleryRoutes = require("./src/event/routes/gallery.routes"); 
const groupRoutes = require("./src/event/routes/group.routes");
const publicationItemRoutes = require("./src/event/routes/publication.routes"); 
const publicationGroupsRoutes = require("./src/event/routes/publictionGroup.routes"); 
const collaboratorRoutes = require("./src/event/routes/collaborator.routes");
const emailTemplateRoutes = require("./src/event/routes/emailTemplate.routes"); 
const contactRoutes = require("./src/event/routes/importdata.routes")
const engageRoutes = require("./src/event/routes/engage.routes");
const vanueMapRoutes = require("./src/event/routes/venueMap.routes")
const featureTabSettingRoutes = require('./src/event/routes/featureSetting.routes')
const { initializeSocket } = require('./src/socket');
const socialWallPostRoutes = require('./src/event/routes/socialaallPost.routes')
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
app.use("/api/feature-setsing", featureTabSettingRoutes)



// social wall post 
app.use('/api/socialwallPost', socialWallPostRoutes);

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
