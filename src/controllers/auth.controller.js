const {
  findUserByEmail,
  createUser,
  findUserById,
  updateUser,
  deleteUser,
  updateUserPassword,
  findUserByPhone
} = require("../models/user.models");


const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const nodemailer = require("nodemailer");
const twilio = require("twilio");

// Email, phone aur password validators
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Password ko strong karne ke liye 8+ chars, uppercase, lowercase, number, special char check
const isStrongPassword = (password) =>
  typeof password === "string" &&
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);

const isValidPhoneNumber = (phoneNumber) => /^[6-9]\d{9}$/.test(phoneNumber);

exports.signup = async (req, res) => {
  let { firstName, lastName, email, password, phoneNumber, userType } = req.body;

  // Basic validation: sab fields filled hain?
  if (!firstName || !lastName || !email || !password || !phoneNumber || !userType) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // userType ko normalize karo aur allowed values check karo
  userType = userType.toLowerCase();
  if (!["event", "community"].includes(userType)) {
    return res.status(400).json({ message: "userType must be either 'event' or 'community'" });
  }
  const userTypeEnum = userType.toUpperCase();

  // Email format validation
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  // Password strong hona chahiye
  if (!isStrongPassword(password)) {
    return res.status(400).json({
      message:
        "Password must be minimum 8 characters with uppercase, lowercase, number, and special character",
    });
  }


  if (!isValidPhoneNumber(phoneNumber)) {
    return res.status(400).json({
      message: "Invalid phone number. It must be 10 digits and start with 6-9.",
    });
  }

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    //phone Number already existst
    const existingUserByPhone = await findUserByPhone(phoneNumber);
    if (existingUserByPhone) {
      return res.status(400).json({ message: "Phone number already exists" });
      }
      

    // Password hash karo (salt rounds 12 for better security)
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await createUser({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber,
      userType: userTypeEnum,
      hasLoggedIn: false,
      loginCount: 0,
    });

    // Nodemailer transporter setup
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Signup Confirmation",
      html: `
<div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px; border-radius: 10px; border: 1px solid #ddd;">
  <div style="background-color: #007bff; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; color: white;">
    <h2 style="margin: 0;">🎉 Welcome, ${firstName} ${lastName}!</h2>
  </div>
  <div style="background-color: white; padding: 25px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; color: #333;">You have successfully signed up as a <strong style="color: #007bff;">${userType}</strong>.</p>
    <table style="width: 100%; font-size: 15px; margin-top: 20px;">
      <tr>
        <td style="padding: 8px 0;"><strong>Email:</strong></td>
        <td style="padding: 8px 0; color: #555;">${email}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0;"><strong>Phone Number:</strong></td>
        <td style="padding: 8px 0; color: #555;">${phoneNumber}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0;"><strong>Password:</strong></td>
        <td style="padding: 8px 0; color: #555;">${password}</td>  <!-- yahan plain password aa raha hai -->
      </tr>
    </table>
    <p style="margin-top: 30px; font-size: 15px; color: #333;">
      Thank you for registering. We're excited to have you onboard! 🚀
    </p>
    <div style="text-align: center; margin-top: 30px;">
      <a href="https://yourdomain.com/login" style="background-color: #007bff; color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: bold;">Login Now</a>
    </div>
  </div>
  <div style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
    &copy; ${new Date().getFullYear()} Moozup. All rights reserved.
  </div>
</div>
      `,
    };

    transporter.sendMail(mailOptions).catch((err) => {
      console.error("Email sending failed:", err);
    });

    res.status(201).json({
      message: "User created successfully and confirmation email sent",
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        userType: newUser.userType,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};



// Twilio client
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

  // OTP Store: In-memory, with expiration and retry limits (only for demo!)
// Replace with DB or cache for production
const otpStore = {};

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Clean expired OTPs every 10 mins to save memory (optional)
setInterval(() => {
  const now = Date.now();
  for (const key in otpStore) {
    if (otpStore[key].expiresAt < now) {
      delete otpStore[key];
    }
  }
}, 10 * 60 * 1000);

function normalizePhone(phoneNumber) {
  if (!phoneNumber) return null;
  if (phoneNumber.startsWith("+")) return phoneNumber;
  // Assuming India numbers - add +91 by default
  return "+91" + phoneNumber;
}

exports.login = async (req, res) => {
  try {
    const { email, password, phoneNumber, otp } = req.body;

    // Validate presence of either email or phoneNumber
    if (!email && !phoneNumber) {
      return res.status(400).json({ message: "Email or phone number is required" });
    }

    const key = email || phoneNumber;

    // OTP verification block
    if (otp) {
      const stored = otpStore[key];
      if (!stored) {
        return res.status(400).json({ message: "No OTP requested or OTP expired. Please request a new OTP." });
      }

      if (stored.expiresAt < Date.now()) {
        delete otpStore[key];
        return res.status(400).json({ message: "OTP expired. Please request a new OTP." });
      }

      if (stored.otp !== otp) {
        // Track failed attempts to prevent brute force
        stored.failedAttempts = (stored.failedAttempts || 0) + 1;
        if (stored.failedAttempts > 5) {
          delete otpStore[key];
          return res.status(429).json({ message: "Too many failed attempts. Please request a new OTP." });
        }
        return res.status(400).json({ message: "Invalid OTP. Try again." });
      }

      // OTP valid: cleanup and login user
      delete otpStore[key];

      // Find user by email or phone
      let user = email ? await findUserByEmail(email) : await findUserByPhone(phoneNumber);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update login metadata (classic stuff)
      await updateUser(user.id, {
        hasLoggedIn: true,
        loginCount: (user.loginCount || 0) + 1,
      });

      // JWT tokens: Short-lived access token, longer refresh token
      const accessToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" } // 1 hour access token lifetime (safer)
      );

      const refreshToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "30d" }
      );

      return res.status(200).json({
        message: "Login successful",
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          userType: user.userType,
        },
      });
    }

    // Start login process if OTP is not provided
    // Email + Password flow
    if (email) {
      if (!password) {
        return res.status(400).json({ message: "Password is required for email login" });
      }

      const user = await findUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid password" });
      }
      // Generate and store OTP with expiry & retry info
      const generatedOtp = generateOTP();
      otpStore[email] = {
        otp: generatedOtp,
        expiresAt: Date.now() + 5 * 60 * 1000, // OTP valid for 5 minutes
        failedAttempts: 0,
        sentCount: (otpStore[email]?.sentCount || 0) + 1,
      };
      
      if (otpStore[email].sentCount > 5) {
        return res.status(429).json({ message: "Too many OTP requests. Please try again later." });
      }
      
      // Send OTP SMS via Twilio
      const toPhone = normalizePhone(user.phoneNumber);
      
      await client.messages.create({
        body: `Your login OTP is: ${generatedOtp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: toPhone,
      });

      return res.status(200).json({
        message: "OTP sent to your registered mobile number. Please verify to login.",
      });
    }
    // Phone number only login flow
    if (phoneNumber) {
      const user = await findUserByPhone(phoneNumber);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate and store OTP with expiry & retry info
      const generatedOtp = generateOTP();
      otpStore[phoneNumber] = {
        otp: generatedOtp,
        expiresAt: Date.now() + 5 * 60 * 1000,
        failedAttempts: 0,
        sentCount: (otpStore[phoneNumber]?.sentCount || 0) + 1,
      };

      if (otpStore[phoneNumber].sentCount > 5) {
        return res.status(429).json({ message: "Too many OTP requests. Please try again later." });
      }
      const toPhone = normalizePhone(phoneNumber);

      await client.messages.create({
        body: `Your login OTP is: ${generatedOtp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: toPhone,
      });
      return res.status(200).json({
        message: "OTP sent to your mobile number. Please verify to login.",
      });
    }

    // If no email or phone provided (should never reach here)
    return res.status(400).json({ message: "Please provide email+password or phoneNumber" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};


exports.logout = async (req, res) => {
  try {
    // Server side koi session/token invalidate nahi kar rahe hain, bas client ko batate hain
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
      return res.status(401).json({ message: "Invalid refresh token" });  // 401 Unauthorized
    }

    // Naya access token generate karo
    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Token refreshed successfully",
      accessToken: newAccessToken
    });
  } catch (error) {
    console.error("Refresh token error:", error);

    // Agar error JWT token related ho (expire/invalid)
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Refresh token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // General server error
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};


exports.requestResetOtp = async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;
    const key = email || phoneNumber;

    if (!key) {
      return res.status(400).json({ message: "Email or Phone is required" });
    }

    let user;
    if (email) {
      user = await findUserByEmail(email);
    } else {
      user = await findUserByPhone(phoneNumber);
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOTP();
    otpStore[key] = { otp, verified: false };

    const toPhone = phoneNumber?.startsWith('+') ? phoneNumber : '+91' + phoneNumber;
    const message = `Your OTP for password reset is: ${otp}`;

    if (phoneNumber) {
      await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: toPhone,
      });
    }

    // Optionally send email here if using email

    return res.status(200).json({ message: "OTP sent successfully. Please verify to reset password." });
  } catch (error) {
    console.error("OTP Request Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.verifyResetOtp = async (req, res) => {
  try {
    const { email, phoneNumber, otp } = req.body;
    const key = email || phoneNumber;

    if (!key || !otp) {
      return res.status(400).json({ message: "Email/Phone and OTP are required" });
    }

    const stored = otpStore[key];
    if (!stored || stored.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    otpStore[key].verified = true; // Mark OTP as verified

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.resetPassword = async (req, res) => {
  try {
    const { email, phoneNumber, newPassword } = req.body;
    const key = email || phoneNumber;

    if (!key || !newPassword) {
      return res.status(400).json({ message: "Email/Phone and new password are required" });
    }

    // const stored = otpStore[key];
    // if (!stored || !stored.verified) {
    //   return res.status(400).json({ message: "OTP verification is required before resetting password" });
    // }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({ message: "Password must be minimum 8 characters with uppercase, lowercase, number, and special character" });
    }

    let user;
    if (email) {
      user = await findUserByEmail(email);
    } else {
      user = await findUserByPhone(phoneNumber);
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(user.id, hashedPassword);

    delete otpStore[key]; // 🔐 Remove old OTP after successful reset

    return res.status(200).json({ message: "Password reset successful. You can now log in with your new password." });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Error resetting password", error: error.message });
  }
};

