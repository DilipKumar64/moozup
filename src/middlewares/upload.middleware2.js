// middleware/upload.middleware.js
const multer = require("multer");

const docTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const excelTypes = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

const storage = multer.memoryStorage(); // ✅ use memoryStorage for all

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "fileUrl" && !docTypes.includes(file.mimetype)) {
    return cb(new Error("Only document files are allowed for publication"), false);
  }

  if (file.fieldname === "excelSheet" && !excelTypes.includes(file.mimetype)) {
    return cb(new Error("Only Excel files are allowed for contact import"), false);
  }

  cb(null, true);
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
  contactExcel: upload.fields([{ name: "excelSheet", maxCount: 1 }]),
  venueMap:upload.fields([{name:"venueMap", maxCount:1}]),
  newsPostImages: upload.fields([{ name: "images", maxCount: 10 }]),
  image: upload.fields([{name:"image", maxCount:1}])

};

module.exports = uploadFields;
