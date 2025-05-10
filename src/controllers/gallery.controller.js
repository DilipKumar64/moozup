const {
  createGalleryItem,
  getGalleryItems,
} = require("../models/galleryModel");
const uploadToSupabase = require("../utils/uploadToSupabase");

exports.uploadGalleryItem = async (req, res) => {
  try {
    const {
      imagelabel,
      Videolabel,
      groupId,
      eventId,
      userId,
    } = req.body;

    let GallerPhotoUrl = null;
    let GallerVideoUrl = null;

    if (req.files?.imageUrl?.length > 0) {
      GallerPhotoUrl = await uploadToSupabase(req.files.imageUrl[0], "GalleryPhoto");
    }

    if (req.files?.videoUrl?.length > 0) {
      GallerVideoUrl = await uploadToSupabase(req.files.videoUrl[0], "GalleryVideo");
    }

    const item = await createGalleryItem({
      imagelabel,
      Videolabel,
      imageUrl: GallerPhotoUrl,
      videoUrl: GallerVideoUrl,
      groupId: groupId || null,
      eventId: parseInt(eventId),
      userId: parseInt(userId),
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
