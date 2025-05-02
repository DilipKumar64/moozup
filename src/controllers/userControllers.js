const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { findUserByEmail, createUser, findUserById, updateUser, deleteUser } = require("../models/userModels");
require("dotenv").config();

// Email validation
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Password strength
const isStrongPassword = (password) =>
  typeof password === "string" && password.length >= 6;

const isIdValid = (id) => {
  return !isNaN(parseInt(id)) && parseInt(id) > 0;
}

exports.signup = async (req, res) => {
  const { firstName,lastName, email, password } = req.body;

  if (!firstName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await createUser({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    // Client will manually remove token (from localStorage/cookies)
    res.status(200).json({ message: "Logout successful. Please clear tokens from client side." });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await findUserByEmail(decoded.email);
    if (!user) {
      return res.status(400).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

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

