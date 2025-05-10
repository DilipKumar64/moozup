const { createGalleryItem, getGalleryItems } = require("../models/galleryModel");

exports.uploadItem = async (req, res) => {
  const { imagelabel, Videolabel, imageUrl, videoUrl, groupId, eventId, userId } = req.body;

  try {
    const item = await createGalleryItem({
      imagelabel,
      Videolabel,
      imageUrl,
      videoUrl,
      groupId: groupId || null,
      eventId,
      userId
    });

    res.status(201).json(item);
  } catch (error) {
    console.error("Error uploading item:", error);
    res.status(500).json({ message: "Failed to upload item" });
  }
};


exports.fetchGalleryItems = async (req, res) => {
  const { groupId, eventId, userId } = req.query;

  try {
    const items = await getGalleryItems({ groupId, eventId, userId });
    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching gallery items:", error);
    res.status(500).json({ message: "Failed to fetch gallery items" });
  }
};