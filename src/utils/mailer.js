const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

exports.sendWelcomeEmail = async ({ to, firstName, email }) => {
  const mailOptions = {
    from: `"Your App Name" <${process.env.SMTP_USER}>`,
    to,
    subject: "Welcome to Our App!",
    html: `
      <h2>Welcome, ${firstName}!</h2>
      <p>Thank you for signing up with us.</p>
      <p>Your registered email: <b>${email}</b></p>
      <p>We're excited to have you on board!</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};

exports.sendPasswordResetEmail = async ({ to, firstName, newPassword }) => {
  const mailOptions = {
    from: `"Moozup" <${process.env.SMTP_USER}>`,
    to,
    subject: "Password Reset - Moozup",
    html: `
      <h2>Password Reset Successful</h2>
      <p>Hello ${firstName},</p>
      <p>Your password has been reset successfully.</p>
      <p>Your new password is: <strong>${newPassword}</strong></p>
      <p>If you didn't request this password reset, please contact support immediately.</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};
