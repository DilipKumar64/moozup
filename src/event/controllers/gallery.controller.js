const { findEventById } = require("../models/eventModel");
const {
  createGalleryItem,
  getGalleryItems,
  getGalleryItemById,
  deleteGalleryItem,
} = require("../models/galleryModel");
const { findUserById } = require("../../services/user.models");
const deleteFromSupabase = require("../../utils/deleteFromSupabase");
const getSupabasePath = require("../../utils/getSupabasePath");
const uploadToSupabase = require("../../utils/uploadToSupabase");



exports.uploadGalleryItem = async (req, res) => {
  try {
    const {
      imagelabel,
      Videolabel,
      groupId,
      eventId,
      userId,
    } = req.body;

    // 🔍 Validate event
    const event = await findEventById(eventId);
    if (!event) {
      return res.status(400).json({ message: "Invalid event ID. Event not found." });
    }

    // 🔍 Validate userId
    const user = await findUserById(userId);
    if (!user) {
      return res.status(400).json({ message: "Invalid user ID. User not found." });
    }


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



exports.deleteGalleryItem = async (req, res) => {
  const { id } = req.params;

  try {
    // 👁‍🗨 Get item from DB first
    const existingItem = await getGalleryItemById(id);

    if (!existingItem) {
      return res.status(404).json({ message: "Gallery item not found" });
    }

    // 🖼 Delete image from Supabase if exists
    if (existingItem.imageUrl) {
      const imagePath = getSupabasePath(existingItem.imageUrl, "moozup/GalleryPhoto");
      await deleteFromSupabase("moozup", `GalleryPhoto/${imagePath}`);
    }

    // 🎥 Delete video from Supabase if exists
    if (existingItem.videoUrl) {
      const videoPath = getSupabasePath(existingItem.videoUrl, "moozup/GalleryVideo");
      await deleteFromSupabase("moozup", `GalleryVideo/${videoPath}`);
    }

    // ✅ Delete from DB
    const deletedItem = await deleteGalleryItem(id);

    res.status(200).json({
      message: "Gallery item deleted successfully",
      deletedItem,
    });

  } catch (error) {
    console.error("Error deleting gallery item:", error);
    res.status(500).json({ message: "Failed to delete gallery item" });
  }
};
