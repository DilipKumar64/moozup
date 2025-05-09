const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Multiple reusable upload configurations
const uploadFields = {
  eventMedia: upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  eventPhotos: upload.fields([
    { name: "photo", maxCount: 1 },
  ]),
  profilePicture: upload.fields([
    { name: "profilePicture", maxCount: 1 },
  ]),
  // Add more as needed
};

module.exports = uploadFields;
