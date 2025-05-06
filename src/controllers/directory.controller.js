const {
  createExhibitorType,
  findExhibitorTypeById,
  findExhibitorTypesByEventId,
  updateExhibitorType,
  deleteExhibitorType
} = require('../models/exhibitor.type.model');

const {
  createParticipationType,
  findParticipationTypeById,
  findParticipationTypesByEventId,
  updateParticipationType,
  deleteParticipationType,
  updateVisibility,
  updateEventAllowance
} = require('../models/participation.type.model');

const {
  createSponsorType,
  findSponsorTypeById,
  findSponsorTypesByEventId,
  updateSponsorType,
  deleteSponsorType
} = require('../models/sponsor.types.model');

const isIdValid = (id) => {
  return !isNaN(parseInt(id)) && parseInt(id) > 0;
};

// Exhibitor Type Controllers
exports.createExhibitorType = async (req, res) => {
  const {
    type,
    eventId
  } = req.body;

  if (!type || !eventId) {
    return res.status(400).json({ message: "Type and event ID are required" });
  }

  try {
    const exhibitorType = await createExhibitorType({
      type,
      priority: 0,
      isActive: true,
      eventId: parseInt(eventId)
    });

    res.status(201).json({
      message: "Exhibitor type created successfully",
      exhibitorType
    });
  } catch (error) {
    console.error("Create exhibitor type error:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

exports.updateExhibitorType = async (req, res) => {
  const { id } = req.params;
  const {
    type,
    priority
  } = req.body;

  if (!isIdValid(id)) {
    return res.status(400).json({ message: "Invalid exhibitor type ID" });
  }

  try {
    const existingType = await findExhibitorTypeById(id);
    if (!existingType) {
      return res.status(404).json({ message: "Exhibitor type not found" });
    }

    const updatedType = await updateExhibitorType(id, {
      type,
      priority
    });

    res.status(200).json({
      message: "Exhibitor type updated successfully",
      exhibitorType: updatedType
    });
  } catch (error) {
    console.error("Update exhibitor type error:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

exports.deleteExhibitorType = async (req, res) => {
  const { id } = req.params;

  if (!isIdValid(id)) {
    return res.status(400).json({ message: "Invalid exhibitor type ID" });
  }

  try {
    const existingType = await findExhibitorTypeById(id);
    if (!existingType) {
      return res.status(404).json({ message: "Exhibitor type not found" });
    }

    await deleteExhibitorType(id);

    res.status(200).json({
      message: "Exhibitor type deleted successfully"
    });
  } catch (error) {
    console.error("Delete exhibitor type error:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

exports.getExhibitorTypesByEvent = async (req, res) => {
  const { eventId } = req.params;

  if (!isIdValid(eventId)) {
    return res.status(400).json({ message: "Invalid event ID" });
  }

  try {
    const exhibitorTypes = await findExhibitorTypesByEventId(eventId);

    res.status(200).json({
      message: "Exhibitor types retrieved successfully",
      exhibitorTypes
    });
  } catch (error) {
    console.error("Get exhibitor types error:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

// Participation Type Controllers
exports.createParticipationType = async (req, res) => {
  const {
    personParticipationType,
    groupParticipationName,
    eventId
  } = req.body;

  if (!personParticipationType || !groupParticipationName || !eventId) {
    return res.status(400).json({ message: "Person participation type, group participation name, and event ID are required" });
  }

  try {
    const participationType = await createParticipationType({
      personParticipationType,
      groupParticipationName,
      priority: 0,
      isVisibleInApp: true,
      isAllowedInEvent: true,
      eventId: parseInt(eventId)
    });

    res.status(201).json({
      message: "Participation type created successfully",
      participationType
    });
  } catch (error) {
    console.error("Create participation type error:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

exports.updateParticipationType = async (req, res) => {
  const { id } = req.params;
  const {
    personParticipationType,
    groupParticipationName,
    priority
  } = req.body;

  if (!isIdValid(id)) {
    return res.status(400).json({ message: "Invalid participation type ID" });
  }

  try {
    const existingType = await findParticipationTypeById(id);
    if (!existingType) {
      return res.status(404).json({ message: "Participation type not found" });
    }

    const updatedType = await updateParticipationType(id, {
      personParticipationType,
      groupParticipationName,
      priority
    });

    res.status(200).json({
      message: "Participation type updated successfully",
      participationType: updatedType
    });
  } catch (error) {
    console.error("Update participation type error:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

exports.deleteParticipationType = async (req, res) => {
  const { id } = req.params;

  if (!isIdValid(id)) {
    return res.status(400).json({ message: "Invalid participation type ID" });
  }

  try {
    const existingType = await findParticipationTypeById(id);
    if (!existingType) {
      return res.status(404).json({ message: "Participation type not found" });
    }

    await deleteParticipationType(id);

    res.status(200).json({
      message: "Participation type deleted successfully"
    });
  } catch (error) {
    console.error("Delete participation type error:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

exports.updateVisibility = async (req, res) => {
  const { id } = req.params;
  const { isVisibleInApp } = req.body;

  if (!isIdValid(id)) {
    return res.status(400).json({ message: "Invalid participation type ID" });
  }

  if (typeof isVisibleInApp !== 'boolean') {
    return res.status(400).json({ message: "isVisibleInApp must be a boolean value" });
  }

  try {
    const existingType = await findParticipationTypeById(id);
    if (!existingType) {
      return res.status(404).json({ message: "Participation type not found" });
    }

    const updatedType = await updateVisibility(id, isVisibleInApp);

    res.status(200).json({
      message: "Visibility updated successfully",
      participationType: updatedType
    });
  } catch (error) {
    console.error("Update visibility error:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

exports.updateEventAllowance = async (req, res) => {
  const { id } = req.params;
  const { isAllowedInEvent } = req.body;

  if (!isIdValid(id)) {
    return res.status(400).json({ message: "Invalid participation type ID" });
  }

  if (typeof isAllowedInEvent !== 'boolean') {
    return res.status(400).json({ message: "isAllowedInEvent must be a boolean value" });
  }

  try {
    const existingType = await findParticipationTypeById(id);
    if (!existingType) {
      return res.status(404).json({ message: "Participation type not found" });
    }

    const updatedType = await updateEventAllowance(id, isAllowedInEvent);

    res.status(200).json({
      message: "Event allowance updated successfully",
      participationType: updatedType
    });
  } catch (error) {
    console.error("Update event allowance error:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

exports.getParticipationTypesByEvent = async (req, res) => {
  const { eventId } = req.params;

  if (!isIdValid(eventId)) {
    return res.status(400).json({ message: "Invalid event ID" });
  }

  try {
    const participationTypes = await findParticipationTypesByEventId(eventId);

    res.status(200).json({
      message: "Participation types retrieved successfully",
      participationTypes
    });
  } catch (error) {
    console.error("Get participation types error:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

// Sponsor Type Controllers
exports.createSponsorType = async (req, res) => {
  const {
    type,
    eventId
  } = req.body;

  if (!type || !eventId) {
    return res.status(400).json({ message: "Type and event ID are required" });
  }

  try {
    const sponsorType = await createSponsorType({
      type,
      priority: 0,
      isActive: true,
      eventId: parseInt(eventId)
    });

    res.status(201).json({
      message: "Sponsor type created successfully",
      sponsorType
    });
  } catch (error) {
    console.error("Create sponsor type error:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

exports.updateSponsorType = async (req, res) => {
  const { id } = req.params;
  const {
    type,
    priority
  } = req.body;

  if (!isIdValid(id)) {
    return res.status(400).json({ message: "Invalid sponsor type ID" });
  }

  try {
    const existingType = await findSponsorTypeById(id);
    if (!existingType) {
      return res.status(404).json({ message: "Sponsor type not found" });
    }

    const updatedType = await updateSponsorType(id, {
      type,
      priority
    });

    res.status(200).json({
      message: "Sponsor type updated successfully",
      sponsorType: updatedType
    });
  } catch (error) {
    console.error("Update sponsor type error:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

exports.deleteSponsorType = async (req, res) => {
  const { id } = req.params;

  if (!isIdValid(id)) {
    return res.status(400).json({ message: "Invalid sponsor type ID" });
  }

  try {
    const existingType = await findSponsorTypeById(id);
    if (!existingType) {
      return res.status(404).json({ message: "Sponsor type not found" });
    }

    await deleteSponsorType(id);

    res.status(200).json({
      message: "Sponsor type deleted successfully"
    });
  } catch (error) {
    console.error("Delete sponsor type error:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

exports.getSponsorTypesByEvent = async (req, res) => {
  const { eventId } = req.params;

  if (!isIdValid(eventId)) {
    return res.status(400).json({ message: "Invalid event ID" });
  }

  try {
    const sponsorTypes = await findSponsorTypesByEventId(eventId);

    res.status(200).json({
      message: "Sponsor types retrieved successfully",
      sponsorTypes
    });
  } catch (error) {
    console.error("Get sponsor types error:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};
