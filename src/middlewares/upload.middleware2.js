const multer = require("multer");
const storage = multer.memoryStorage();

// Document file types allowed
const docTypes = [
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/pdf",
];

// File filter to only allow documents for 'fileUrl' in publication
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "fileUrl" && !docTypes.includes(file.mimetype)) {
    return cb(new Error("Only document files are allowed for publication"), false);
  }
  cb(null, true); // Baaki sab fields allowed hain
};

const upload = multer({ storage, fileFilter });

const uploadFields = {
  eventMedia: upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  eventPhotos: upload.fields([{ name: "photo", maxCount: 1 }]),
  profilePicture: upload.fields([{ name: "profilePicture", maxCount: 1 }]),
  Gallery: upload.fields([
    { name: "imageUrl", maxCount: 1 },
    { name: "videoUrl", maxCount: 1 },
  ]),
  publication: upload.fields([{ name: "fileUrl", maxCount: 1 }]),
};

module.exports = uploadFields;
