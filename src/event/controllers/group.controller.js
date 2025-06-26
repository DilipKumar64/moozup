const e = require("express");
const { createGroupWithImages, getGroupById, findAllGroup, deleteGroupById } = require("../models/group.model");
const { getGalleryItemById } = require("../models/galleryModel");


exports.createNewGroup = async (req, res) => {
  const { name, galleryItems } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ message: "Group name is required." });
    }

    if (!Array.isArray(galleryItems) || galleryItems.length === 0) {
      return res.status(400).json({ message: "At least one gallery item is required." });
    }

    // Validate each gallery item exists
    for (let id of galleryItems) {
      const itemExists = await getGalleryItemById(id);
      if (!itemExists) {
        return res.status(404).json({ message: `Gallery item not found: ${id}` });
      }
    }

    const group = await createGroupWithImages({ name, galleryItems });
    res.status(201).json(group);

  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ message: "Failed to create group" });
  }
};


exports.getGroupById = async (req, res) => {
  const { groupId } = req.params; // Get groupId from the URL parameters

  try {
    const group = await getGroupById(groupId); // Fetch group details by ID
    return res.json(group);  // Send the group data as JSON response
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message }); // Send error response if something goes wrong
  }
};

exports.getAllGroups = async (req, res) => {
  try {
    const groups = await findAllGroup(); // Fetch all groups
    return res.json(groups); // Send the groups data as JSON response
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message }); // Send error response if something goes wrong
  }
};

exports.deleteGroup = async (req, res) => {
  const { groupId } = req.params;

  try {
    const result = await deleteGroupById(groupId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting group:", error);
    return res.status(500).json({ message: error.message });
  }
};