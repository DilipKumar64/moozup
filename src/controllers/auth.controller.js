const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { findUserByEmail, createUser, findUserById, updateUser, deleteUser, updateUserPassword } = require("../models/userModels");
const { sendWelcomeEmail, sendPasswordResetEmail } = require("../utils/mailer");
require("dotenv").config();

// Email validation
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Password strength
const isStrongPassword = (password) =>
  typeof password === "string" && password.length >= 6;

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

    // Send welcome email (do not block response on email sending)
    // sendWelcomeEmail({ to: email, firstName, email }).catch((err) => {
    //   console.error("Failed to send welcome email:", err);
    // });

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

exports.resetPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ 
        message: "Both old password and new password are required" 
      });
    }

    // Validate password strength
    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({ 
        message: "New password must be at least 6 characters long" 
      });
    }
    
    // Validate user exists
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user's password in database
    await updateUserPassword(userId, hashedPassword);
    
    // Send email notification and do not block response on email sending
    // sendPasswordResetEmail({
    //   to: user.email,
    //   firstName: user.firstName,
    //   newPassword
    // }).catch((err) => {
    //   console.error("Failed to send reset email:", err);
    // });
    
    res.status(200).json({ 
      message: "Password updated successfully. Please check your email for confirmation."
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ 
      message: "Error updating password",
      error: error.message 
    });
  }
};


