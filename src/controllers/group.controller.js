const e = require("express");
const { createGroupWithImages, getGroupById, findAllGroup } = require("../models/group.model");

exports.createNewGroup = async (req, res) => {
  const { name, galleryItems } = req.body;


  try {
    const group = await createGroupWithImages({ name, galleryItems });
    res.status(201).json(group);
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ message: error.message });
  }
};


exports.getGroup = async (req, res) => {
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