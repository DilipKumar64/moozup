const express = require("express");
require("dotenv").config();
const cors = require("cors");
const morgan = require("morgan");
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
const app = express();

// Middleware
app.use(cors());
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


// Health check route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running" });
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
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// Only start the server if we're not in a serverless environment
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server is live at: http://localhost:${PORT}
    🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

// Export for Vercel
module.exports = app;
