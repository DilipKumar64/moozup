const { createPublicationItem, getPublicationItems, getPublicationItemsByEventId, deletePublicationItemById } = require("../models/publicationItem.model");
const uploadToSupabase = require("../utils/uploadToSupabase");
const getSupabasePath = require("../utils/getSupabasePath");
const deleteFromSupabase = require("../utils/deleteFromSupabase");

exports.uploadPublicationitem = async (req, res) => {
  try {
    const { message, publicationsGroupId, eventId, userId } = req.body;

    let PublicationFileUrl = null;
    if (req.files?.fileUrl?.length > 0) {
      PublicationFileUrl = await uploadToSupabase(req.files.fileUrl[0], "PublicationItem");
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


exports.fetchPublicationItemsByEventId = async (req, res) => {
  const { eventId } = req.params;

  try {
    if (!eventId) {
      return res.status(400).json({ message: "Event ID is required" });
    }

    const items = await getPublicationItemsByEventId(eventId);

    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching publication items:", error);
    res.status(500).json({ message: "Failed to fetch publication items", error: error.message });
  }
};

exports.deletePublicationItem = async (req, res) => {
  const { id } = req.params;

  try {
    const item = await deletePublicationItemById(id);

    // Supabase file deletion
    if (item.fileUrl) {
      const docPath = getSupabasePath(item.fileUrl, "moozup"); // ✅ bucket only
      console.log("📄 Deleting document path from Supabase:", docPath);

      if (docPath) {
        await deleteFromSupabase("moozup", docPath); // ✅ no extra folder prefix
      } else {
        console.warn("⚠️ docPath is null, skipping deleteFromSupabase");
      }
    }

    res.status(200).json({ message: "Publication deleted", item });
  } catch (error) {
    console.error("Error deleting publication item:", error);
    res.status(500).json({ message: "Failed to delete publication", error: error.message });
  }
};


