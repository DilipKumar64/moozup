// utils/rateLimiter.js

const rateLimit = require('express-rate-limit');

/**
 * Rate limiter middleware for sensitive endpoints like login
 * Limits each IP to 10 requests every 15 minutes
 */
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count both successful and failed requests

  // Custom response on limit exceeded
  handler: (req, res, next, options) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip}`);
    return res.status(options.statusCode).json({
      status: 429,
      error: 'Too Many Requests',
      message: 'Too many login attempts. Please try again after 15 minutes.',
    });
  },

  // Custom key generator (IP-based)
  keyGenerator: (req, res) => req.ip,
});

module.exports = loginRateLimiter;
