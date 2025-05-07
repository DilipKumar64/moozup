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
  findUsersByEventId
} = require('../models/user.models');
const FileService = require('../services/file.service');
const { sendWelcomeEmail, sendPasswordEmail } = require('../utils/mailer');
const bcrypt = require('bcrypt');

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

  try {
    const users = await findUsersByEventId(eventId);

    res.status(200).json({
      message: "Event users retrieved successfully",
      users
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
};
