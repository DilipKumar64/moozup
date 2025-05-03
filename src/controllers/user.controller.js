const { findUserById, updateUser, deleteUser } = require('../models/userModels');
const { createFollow, findFollow, countFollowers, countFollowing } = require('../models/follow.model');

const isIdValid = (id) => {
    return !isNaN(parseInt(id)) && parseInt(id) > 0;
}

// Get user profile by ID
exports.getProfileById = async (req, res) => {
    const { id } = req.params;
  
    if (!isIdValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
  
    try {
        const user = await findUserById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
  
        // Remove sensitive information before sending response
        const { password, ...userWithoutPassword } = user;
      
        res.status(200).json({
            message: "User profile retrieved successfully",
            user: userWithoutPassword
        });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};

  // Update user profile
exports.updateProfile = async (req, res) => {
    const { id } = req.params;
    const { 
        firstName, 
        lastName, 
        email, // We'll keep this in destructuring but won't use it
        profilePicture,
        dateOfBirth,
        gender,
        addressLine1,
        addressLine2,
        city,
        state,
        zipCode,
        phoneNumber,
        phoneExtension,
        language,
        country
    } = req.body;

    if (!isIdValid(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    // Validate required fields
    if (!firstName) {
        return res.status(400).json({ message: "First name is required" });
    }

    // If email is provided in the request, return error
    if (email) {
        return res.status(400).json({ message: "Email cannot be updated through this endpoint" });
    }

    try {
        // Check if user exists
        const existingUser = await findUserById(id);
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update user profile
        const updatedUser = await updateUser(id, {
            firstName,
            lastName,
            profilePicture,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
            gender,
            addressLine1,
            addressLine2,
            city,
            state,
            zipCode,
            phoneNumber,
            phoneExtension,
            language,
            country
        });

        // Remove sensitive information before sending response
        const { password, ...userWithoutPassword } = updatedUser;

        res.status(200).json({
            message: "Profile updated successfully",
            user: userWithoutPassword
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};

// Delete user account
exports.deleteAccount = async (req, res) => {
    const { id } = req.params;

    if (!isIdValid(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
        // Check if user exists
        const existingUser = await findUserById(id);
        if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
        }

        // Delete the user
        await deleteUser(id);

        res.status(200).json({
        message: "Account deleted successfully"
        });
    } catch (error) {
        console.error("Delete account error:", error);
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};

exports.followUser = async (req, res) => {
  const followerId = req.user.id; // from JWT
  const followingId = parseInt(req.params.id);

  if (followerId === followingId) {
    return res.status(400).json({ message: "You cannot follow yourself." });
  }

  try {
    // Check if already following
    const existing = await findFollow(followerId, followingId);
    if (existing) {
      return res.status(400).json({ message: "Already following this user." });
    }

    // Create follow
    await createFollow(followerId, followingId);

    // Update counts
    await updateUser(followerId, { followingCount: { increment: 1 } });
    await updateUser(followingId, { followersCount: { increment: 1 } });

    return res.json({ success: true, message: "Followed user successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error." });
  }
};