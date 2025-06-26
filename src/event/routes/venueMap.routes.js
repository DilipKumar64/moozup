const express = require("express");
const router = express.Router();
const controller = require("../controllers/venueMap.controller");
const uploadFields = require("../../middlewares/upload.middleware2");
const authenticateJWT = require("../../middlewares/auth.middleware");

router.post("/:eventId/upload", uploadFields.venueMap,authenticateJWT, controller.uploadVenueMap);
router.get("/:eventId/find", controller.getVenueMap);
router.put("/:eventId/update", uploadFields.venueMap, controller.updateVenueMap);
router.delete("/:eventId/delete", controller.deleteVenueMap);

module.exports = router;