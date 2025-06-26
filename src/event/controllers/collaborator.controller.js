const {
  createCollaborator,
  getAllCollaborators,
  deleteCollaborator,
  findEventById,
} = require("../models/collaborator.model");

exports.createCollaborator = async (req, res) => {
  try {
    const { fullName, email, role, eventId, userId } = req.body;

    if (!fullName || !email || !role || !userId || !eventId) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const collaborator = await createCollaborator({
      fullName,
      email,
      role,
      eventId: parseInt(eventId),
      userId: parseInt(userId),
    });
    return res.status(201).json(collaborator);
  } catch (error) {
    console.error("Error creating collaborator:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllCollaborators = async (req, res) => {
  try {
    // const { eventId, userId } = req.query;

    const collaborators = await getAllCollaborators();
    return res.status(200).json(collaborators);
  } catch (error) {
    console.error("Error fetching collaborators:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteCollaborator = async (req, res) => {
  try {
    const { id } = req.params;

    const existTingCollaborator = await findEventById(id);
    if (!existTingCollaborator) {
      return res.status(404).json({ message: "Collaborator not found" });
    }

    const deletedCollaborator = await deleteCollaborator(id);
    return res
      .status(200)
      .json({
        message: "Collaborator deleted successfully",
        deletedCollaborator,
      });
  } catch (error) {
    console.error("Error deleting collaborator:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
