const { createPublicationItem, getPublicationItems } = require("../models/publicationItem.model");
const uploadToSupabase = require("../utils/uploadToSupabase");

exports.uploadPublicationitem = async (req, res) => {
  try {
    const { message, publicationsGroupId, eventId, userId } = req.body;

    let PublicationFileUrl = null;
    if (req.files?.fileUrl?.length > 0) {
      PublicationFileUrl = await uploadToSupabase(req.files.fileUrl[0],"PublicationItem");
    }

    if (!eventId || !userId) {
      return res.status(400).json({ message: "eventId and userId are required" });
    }

    const item = await createPublicationItem({
      message,
      fileUrl: PublicationFileUrl,
      publicationsGroupId: parseInt(publicationsGroupId) || null,
      eventId: parseInt(eventId),
      userId: parseInt(userId),
    });
    res.status(201).json(item);
  } catch (error) {
    console.error("Error uploading item:", error);
    res.status(500).json({ message: "Failed to upload item" });
  }
};

exports.getPublicationItems = async (req, res) => {
  try {
    const items = await getPublicationItems();
    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ message: "Failed to fetch items" });
  }
}
