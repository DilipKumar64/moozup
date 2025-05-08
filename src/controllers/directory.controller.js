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

const {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  deleteUser,
  findUsersByEventId,
  findUsersByParticipationTypeId,
  bulkDeleteUsers,
  bulkUpdateDisplayOrder,
  updateUserDisplayOrder
} = require('../models/user.models');
const FileService = require('../services/file.service');
const { sendWelcomeEmail, sendPasswordEmail } = require('../utils/mailer');
const bcrypt = require('bcrypt');
const { createSponsor, findSponsorById, updateSponsor, addSponsorPersons, addSponsorDocument, deleteSponsor, bulkUpdateSponsorDisplayOrder, updateSponsorDisplayOrder, getAllSponsors } = require('../models/sponsor.model');

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

// Directory User Controller
exports.createDirectoryUser = async (req, res) => {
  const {
    firstName,
    email,
    phoneNumber,
    participationTypeId,
    // Optional fields
    companyName,
    jobTitle,
    city,
    state,
    country,
    phoneExtension,
    facebookUrl,
    linkedinUrl,
    twitterUrl,
    webProfile,
    uid,
    description
  } = req.body;

  // Validate required fields
  if (!firstName || !email || !phoneNumber || !participationTypeId) {
    return res.status(400).json({
      message: "Missing required fields. Required fields are: firstName, lastName, email, phoneNumber, participationTypeId"
    });
  }

  try {
    // Check if user with email already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        message: "A user with this email already exists"
      });
    }

    // Check if participation type exists
    const participationType = await findParticipationTypeById(participationTypeId);
    if (!participationType) {
      return res.status(404).json({ message: "Participation type not found" });
    }

    // Generate and hash password
    const generatedPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Handle profile picture upload
    let profilePictureUrl = null;
    if (req.file) {
      try {
        profilePictureUrl = await FileService.uploadProfilePicture(req.file);
      } catch (uploadError) {
        return res.status(500).json({
          message: "Failed to upload profile picture",
          error: uploadError.message
        });
      }
    }

    // Create the user
    const user = await createUser({
      firstName,
      email,
      phoneNumber,
      participationTypeId: parseInt(participationTypeId),
      // Optional fields
      companyName: companyName || null,
      jobTitle: jobTitle || null,
      city: city || null,
      state: state || null,
      country: country || null,
      phoneExtension: phoneExtension || null,
      facebookUrl: facebookUrl || null,
      linkedinUrl: linkedinUrl || null,
      twitterUrl: twitterUrl || null,
      webProfile: webProfile || null,
      uid: uid || null,
      description: description || null,
      profilePicture: profilePictureUrl,
      status: true,
      role: "user",
      password: hashedPassword
    });

    // Send welcome email with generated password
    // sendWelcomeEmail({
    //     to: email,
    //     firstName,
    //     email,
    //     password: generatedPassword
    //   }).catch((err) => {
    //       console.error("Failed to send welcome email:", err);
    //   });

    res.status(201).json({
      message: "User created successfully in directory",
      user: {
        ...user,
        password: undefined // Don't send password in response
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
};

exports.updateDirectoryUser = async (req, res) => {
  const { id } = req.params;
  const {
    firstName,
    email,
    phoneNumber,
    participationTypeId,
    // Optional fields
    companyName,
    jobTitle,
    city,
    state,
    country,
    phoneExtension,
    facebookUrl,
    linkedinUrl,
    twitterUrl,
    webProfile,
    uid,
    description
  } = req.body;

  try {
    // Check if user exists
    const existingUser = await findUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // If email is being changed, check if new email already exists
    if (email && email !== existingUser.email) {
      const emailExists = await findUserByEmail(email);
      if (emailExists) {
        return res.status(400).json({
          message: "A user with this email already exists"
        });
      }
    }

    // Check if participation type exists if it's being updated
    if (participationTypeId) {
      const participationType = await findParticipationTypeById(participationTypeId);
      if (!participationType) {
        return res.status(404).json({ message: "Participation type not found" });
      }
    }

    // Handle profile picture upload if new file is provided
    let profilePictureUrl = existingUser.profilePicture;
    if (req.file) {
      try {
        // Delete old profile picture if it exists
        if (existingUser.profilePicture) {
          await FileService.deleteProfilePicture(existingUser.profilePicture);
        }
        // Upload new profile picture
        profilePictureUrl = await FileService.uploadProfilePicture(req.file);
      } catch (uploadError) {
        return res.status(500).json({
          message: "Failed to handle profile picture",
          error: uploadError.message
        });
      }
    }

    // Prepare update data
    const updateData = {
      firstName: firstName || existingUser.firstName,
      email: email || existingUser.email,
      phoneNumber: phoneNumber || existingUser.phoneNumber,
      participationTypeId: participationTypeId ? parseInt(participationTypeId) : existingUser.participationTypeId,
      companyName: companyName !== undefined ? companyName : existingUser.companyName,
      jobTitle: jobTitle !== undefined ? jobTitle : existingUser.jobTitle,
      city: city !== undefined ? city : existingUser.city,
      state: state !== undefined ? state : existingUser.state,
      country: country !== undefined ? country : existingUser.country,
      phoneExtension: phoneExtension !== undefined ? phoneExtension : existingUser.phoneExtension,
      facebookUrl: facebookUrl !== undefined ? facebookUrl : existingUser.facebookUrl,
      linkedinUrl: linkedinUrl !== undefined ? linkedinUrl : existingUser.linkedinUrl,
      twitterUrl: twitterUrl !== undefined ? twitterUrl : existingUser.twitterUrl,
      webProfile: webProfile !== undefined ? webProfile : existingUser.webProfile,
      uid: uid !== undefined ? uid : existingUser.uid,
      description: description !== undefined ? description : existingUser.description,
      profilePicture: profilePictureUrl
    };

    // Update the user
    const updatedUser = await updateUser(id, updateData);

    res.status(200).json({
      message: "User updated successfully",
      user: {
        ...updatedUser,
        password: undefined // Don't send password in response
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
};

exports.deleteDirectoryUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if user exists
    const existingUser = await findUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Delete profile picture if it exists
    if (existingUser.profilePicture) {
      try {
        await FileService.deleteProfilePicture(existingUser.profilePicture);
      } catch (uploadError) {
        // Log error but continue with user deletion
        console.error('Failed to delete profile picture:', uploadError);
      }
    }

    // Delete the user
    await deleteUser(id);

    res.status(200).json({
      message: "User deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
};

exports.updateUserNote = async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;

  // Validate note is provided
  if (note === undefined || note === null) {
    return res.status(400).json({
      message: "Note is required"
    });
  }

  try {
    // Check if user exists
    const existingUser = await findUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Validate note length
    if (note.length > 500) {
      return res.status(400).json({
        message: "Note cannot exceed 500 characters"
      });
    }

    // Update only the note field
    const updatedUser = await updateUser(id, { note });

    res.status(200).json({
      message: "User note updated successfully",
      user: {
        ...updatedUser,
        password: undefined // Don't send password in response
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
};

// Function to generate random 8-character alphanumeric password
const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }
  return password;
};

exports.sendUserPassword = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if user exists
    const existingUser = await findUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Generate new password
    const newPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password in database
    await updateUser(id, { password: hashedPassword });

    // Send password email
    try {
      // await sendPasswordEmail({
      //   to: existingUser.email,
      //   firstName: existingUser.firstName,
      //   password: newPassword
      // });

      res.status(200).json({
        message: "New password has been sent to user's email"
      });
    } catch (emailError) {
      // If email fails, revert the password change
      await updateUser(id, { password: existingUser.password });
      throw new Error(`Failed to send email: ${emailError.message}`);
    }
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
};

exports.getUserByEmail = async (req, res) => {
  const { email } = req.params;

  try {
    // Check if user exists
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Return user details
    res.status(200).json({
      message: "User found successfully",
      user: {
        firstName: user.firstName,
        email: user.email,
        password: user.password // Note: This will return the hashed password
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
};

exports.getEventUsers = async (req, res) => {
  const { eventId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  if (page < 1 || limit < 1) {
    return res.status(400).json({
      message: "Page and limit must be positive numbers"
    });
  }

  try {
    const [totalUsers, users] = await findUsersByEventId(eventId, page, limit);
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      message: "Event users retrieved successfully",
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          usersPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
};

exports.bulkDeleteUsers = async (req, res) => {
  const { userIds } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({
      message: "Please provide an array of user IDs to delete"
    });
  }

  try {
    // Validate all IDs are valid numbers
    const invalidIds = userIds.filter(id => isNaN(parseInt(id)));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        message: "Invalid user IDs provided",
        invalidIds
      });
    }

    // Delete the users
    const result = await bulkDeleteUsers(userIds);

    res.status(200).json({
      message: "Users deleted successfully",
      deletedCount: result.count
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
};

exports.bulkUpdateDisplayOrder = async (req, res) => {
  try {
    const { updates } = req.body;

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        message: "Please provide an array of updates with user IDs and display orders"
      });
    }

    // Validate the updates array
    const invalidUpdates = updates.filter(update => 
      !update.id || 
      !update.displayOrder || 
      isNaN(parseInt(update.id)) || 
      isNaN(parseInt(update.displayOrder))
    );

    if (invalidUpdates.length > 0) {
      return res.status(400).json({
        message: "Invalid updates provided",
        invalidUpdates
      });
    }

    // Update the display orders
    const updatedUsers = await bulkUpdateDisplayOrder(updates);

    res.status(200).json({
      message: "Display orders updated successfully",
      updatedCount: updatedUsers.length,
      updatedUsers: updatedUsers.map(user => ({
        id: user.id,
        displayOrder: user.displayOrder,
        name: `${user.firstName} ${user.lastName || ''}`.trim()
      }))
    });
  } catch (error) {
    console.error('Bulk update display order error:', error); // Debug log
    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
};

exports.updateUserDisplayOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { displayOrder } = req.body;

    // Validate input
    if (!id || !displayOrder) {
      return res.status(400).json({
        message: "User ID and display order are required"
      });
    }

    if (isNaN(parseInt(displayOrder))) {
      return res.status(400).json({
        message: "Display order must be a number"
      });
    }

    // Check if user exists
    const existingUser = await findUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Update display order
    const updatedUser = await updateUserDisplayOrder(id, displayOrder);

    res.status(200).json({
      message: "User display order updated successfully",
      user: {
        id: updatedUser.id,
        name: `${updatedUser.firstName} ${updatedUser.lastName || ''}`.trim(),
        displayOrder: updatedUser.displayOrder
      }
    });
  } catch (error) {
    console.error('Update display order error:', error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
};

exports.getUsersByParticipationType = async (req, res) => {
  const { participationTypeId } = req.params;

  // Validate ID
  if (!participationTypeId || isNaN(parseInt(participationTypeId)) || parseInt(participationTypeId) <= 0) {
    return res.status(400).json({
      message: "Invalid participation type ID. ID must be a positive number."
    });
  }

  try {
    // First verify if participation type exists
    const participationType = await findParticipationTypeById(participationTypeId);
    if (!participationType) {
      return res.status(404).json({
        message: "Participation type not found"
      });
    }

    const users = await findUsersByParticipationTypeId(participationTypeId);

    res.status(200).json({
      message: "Users retrieved successfully",
      data: {
        users,
        participationType: {
          id: participationType.id,
          personParticipationType: participationType.personParticipationType,
          groupParticipationName: participationType.groupParticipationName
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
};

exports.createSponsor = async (req, res) => {
  const {
    name,
    website,
    aboutCompany,
    facebookPageUrl,
    linkedinPageUrl,
    twitterPageUrl,
    sponsorTypeId
  } = req.body;

  // Validate required fields
  if (!name || !sponsorTypeId) {
    return res.status(400).json({
      message: "Missing required fields. Required fields are: name, sponsorTypeId"
    });
  }

  try {
    // Validate sponsor type exists
    const sponsorType = await findSponsorTypeById(sponsorTypeId);
    if (!sponsorType) {
      return res.status(404).json({
        message: "Sponsor type not found"
      });
    }

    // Handle logo upload if provided
    let logoUrl = null;
    if (req.file) {
      try {
        logoUrl = await FileService.uploadProfilePicture(req.file);
      } catch (uploadError) {
        return res.status(500).json({
          message: "Failed to upload logo",
          error: uploadError.message
        });
      }
    }

    // Create the sponsor
    const sponsor = await createSponsor({
      name,
      website: website || null,
      aboutCompany: aboutCompany || null,
      facebookPageUrl: facebookPageUrl || null,
      linkedinPageUrl: linkedinPageUrl || null,
      twitterPageUrl: twitterPageUrl || null,
      sponsorTypeId: parseInt(sponsorTypeId),
      logo: logoUrl
    });

    res.status(201).json({
      message: "Sponsor created successfully",
      sponsor
    });
  } catch (error) {
    console.error("Create sponsor error:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
};

exports.updateSponsor = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    website,
    aboutCompany,
    facebookPageUrl,
    linkedinPageUrl,
    twitterPageUrl,
    youtubeUrl,
    sponsorTypeId
  } = req.body;

  try {
    // Check if sponsor exists
    const existingSponsor = await findSponsorById(id);
    if (!existingSponsor) {
      return res.status(404).json({
        message: "Sponsor not found"
      });
    }

    // If sponsorTypeId is provided, validate it exists
    if (sponsorTypeId) {
      const sponsorType = await findSponsorTypeById(sponsorTypeId);
      if (!sponsorType) {
        return res.status(404).json({
          message: "Sponsor type not found"
        });
      }
    }

    // Handle logo upload if provided
    let logoUrl = existingSponsor.logo;
    if (req.file) {
      try {
        // Delete old logo if it exists
        if (existingSponsor.logo) {
          await FileService.deleteProfilePicture(existingSponsor.logo);
        }
        // Upload new logo
        logoUrl = await FileService.uploadProfilePicture(req.file);
      } catch (uploadError) {
        return res.status(500).json({
          message: "Failed to handle logo",
          error: uploadError.message
        });
      }
    }

    // Prepare update data
    const updateData = {
      name: name || existingSponsor.name,
      website: website !== undefined ? website : existingSponsor.website,
      aboutCompany: aboutCompany !== undefined ? aboutCompany : existingSponsor.aboutCompany,
      facebookPageUrl: facebookPageUrl !== undefined ? facebookPageUrl : existingSponsor.facebookPageUrl,
      linkedinPageUrl: linkedinPageUrl !== undefined ? linkedinPageUrl : existingSponsor.linkedinPageUrl,
      twitterPageUrl: twitterPageUrl !== undefined ? twitterPageUrl : existingSponsor.twitterPageUrl,
      youtubeUrl: youtubeUrl !== undefined ? youtubeUrl : existingSponsor.youtubeUrl,
      sponsorTypeId: sponsorTypeId ? parseInt(sponsorTypeId) : existingSponsor.sponsorTypeId,
      logo: logoUrl
    };

    // Update the sponsor
    const updatedSponsor = await updateSponsor(id, updateData);

    res.status(200).json({
      message: "Sponsor updated successfully",
      sponsor: updatedSponsor
    });
  } catch (error) {
    console.error("Update sponsor error:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
};

exports.addSponsorPersons = async (req, res) => {
  const { id } = req.params;
  const { userIds } = req.body;

  // Validate input
  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({
      message: "Please provide an array of user IDs"
    });
  }

  try {
    // Check if sponsor exists
    const existingSponsor = await findSponsorById(id);
    if (!existingSponsor) {
      return res.status(404).json({
        message: "Sponsor not found"
      });
    }

    // Validate all user IDs are numbers
    const invalidIds = userIds.filter(id => isNaN(parseInt(id)));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        message: "Invalid user IDs provided",
        invalidIds
      });
    }

    // Validate all users exist
    const userValidationPromises = userIds.map(async (userId) => {
      const user = await findUserById(userId);
      return { userId, exists: !!user };
    });

    const userValidations = await Promise.all(userValidationPromises);
    const nonExistentUsers = userValidations
      .filter(validation => !validation.exists)
      .map(validation => validation.userId);

    if (nonExistentUsers.length > 0) {
      return res.status(404).json({
        message: "Some users were not found",
        nonExistentUsers
      });
    }

    // Add users to sponsor
    const updatedSponsor = await addSponsorPersons(id, userIds);

    res.status(200).json({
      message: "Sponsor persons added successfully",
      sponsorPersons: updatedSponsor.sponsorPerson.map(person => ({
        id: person.id,
        name: `${person.firstName} ${person.lastName || ''}`.trim(),
        profilePicture: person.profilePicture
      }))
    });
  } catch (error) {
    console.error("Add sponsor persons error:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
};

exports.uploadSponsorDocument = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  // Validate input
  if (!name) {
    return res.status(400).json({
      message: "Document name is required"
    });
  }

  if (!req.file) {
    return res.status(400).json({
      message: "Document file is required"
    });
  }

  try {
    // Check if sponsor exists
    const existingSponsor = await findSponsorById(id);
    if (!existingSponsor) {
      return res.status(404).json({
        message: "Sponsor not found"
      });
    }

    // Upload document to Supabase
    let documentUrl;
    try {
      documentUrl = await FileService.uploadDocument(req.file);
    } catch (uploadError) {
      return res.status(500).json({
        message: "Failed to upload document",
        error: uploadError.message
      });
    }

    // Add document to sponsor
    const document = await addSponsorDocument(id, {
      name,
      url: documentUrl
    });

    res.status(201).json({
      message: "Document uploaded successfully",
      document: {
        id: document.id,
        name: document.name,
        url: document.url,
        createdAt: document.createdAt
      }
    });
  } catch (error) {
    console.error("Upload sponsor document error:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
};

exports.deleteSponsor = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if sponsor exists
    const existingSponsor = await findSponsorById(id);
    if (!existingSponsor) {
      return res.status(404).json({
        message: "Sponsor not found"
      });
    }

    // Delete the sponsor and its associated documents
    await deleteSponsor(id);

    res.status(200).json({
      message: "Sponsor deleted successfully"
    });
  } catch (error) {
    console.error("Delete sponsor error:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
};

exports.bulkUpdateSponsorDisplayOrder = async (req, res) => {
  try {
    const { updates } = req.body;

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        message: "Please provide an array of updates with sponsor IDs and display orders"
      });
    }

    // Validate the updates array
    const invalidUpdates = updates.filter(update => 
      !update.id || 
      !update.displayOrder || 
      isNaN(parseInt(update.id)) || 
      isNaN(parseInt(update.displayOrder))
    );

    if (invalidUpdates.length > 0) {
      return res.status(400).json({
        message: "Invalid updates provided",
        invalidUpdates
      });
    }

    try {
      // Update the display orders
      const updatedSponsors = await bulkUpdateSponsorDisplayOrder(updates);

      res.status(200).json({
        message: "Display orders updated successfully",
        updatedCount: updatedSponsors.length,
        updatedSponsors: updatedSponsors.map(sponsor => ({
          id: sponsor.id,
          name: sponsor.name,
          displayOrder: sponsor.displayOrder
        }))
      });
    } catch (error) {
      // Handle the case where some sponsors were not found
      if (error.message.includes('Sponsors not found')) {
        return res.status(404).json({
          message: error.message
        });
      }
      throw error; // Re-throw other errors
    }
  } catch (error) {
    console.error('Bulk update display order error:', error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
};

exports.updateSponsorDisplayOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { displayOrder } = req.body;

    // Validate input
    if (!id || !displayOrder) {
      return res.status(400).json({
        message: "Sponsor ID and display order are required"
      });
    }

    if (isNaN(parseInt(displayOrder))) {
      return res.status(400).json({
        message: "Display order must be a number"
      });
    }

    // Check if sponsor exists
    const existingSponsor = await findSponsorById(id);
    if (!existingSponsor) {
      return res.status(404).json({
        message: "Sponsor not found"
      });
    }

    // Update display order
    const updatedSponsor = await updateSponsorDisplayOrder(id, displayOrder);

    res.status(200).json({
      message: "Sponsor display order updated successfully",
      sponsor: {
        id: updatedSponsor.id,
        name: updatedSponsor.name,
        displayOrder: updatedSponsor.displayOrder
      }
    });
  } catch (error) {
    console.error('Update sponsor display order error:', error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
};

exports.getAllSponsors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sponsorTypeId = req.query.sponsorTypeId || null;

    // Validate pagination parameters
    if (page < 1 || limit < 1) {
      return res.status(400).json({
        message: "Page and limit must be positive numbers"
      });
    }

    // Validate sponsorTypeId if provided
    if (sponsorTypeId) {
      if (isNaN(parseInt(sponsorTypeId))) {
        return res.status(400).json({
          message: "Invalid sponsor type ID"
        });
      }

      // Check if sponsor type exists
      const sponsorType = await findSponsorTypeById(sponsorTypeId);
      if (!sponsorType) {
        return res.status(404).json({
          message: `Sponsor type with ID ${sponsorTypeId} not found`
        });
      }
    }

    const result = await getAllSponsors(page, limit, sponsorTypeId);

    res.status(200).json({
      message: "Sponsors retrieved successfully",
      data: {
        sponsors: result.sponsors,
        pagination: {
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          totalSponsors: result.total,
          sponsorsPerPage: limit,
          hasNextPage: result.hasNextPage,
          hasPreviousPage: result.hasPreviousPage
        }
      }
    });
  } catch (error) {
    console.error("Get all sponsors error:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
};
