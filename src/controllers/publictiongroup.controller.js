const { createGroupWithDocument, findAllGroup } = require("../models/publictionGroup.Model");

exports.creayteNewPublicationGroup = async (req, res) => {
  const { name, publicationsItem } = req.body;

  try {
    const group = await createGroupWithDocument({ name, publicationsItem });
    res.status(201).json(group);
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllPublicationGroup = async (req, res) => {
  try {
    const groups = await findAllGroup();
    res.status(200).json(groups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ message: error.message });
  }
};
