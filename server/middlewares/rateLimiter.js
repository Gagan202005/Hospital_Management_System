const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const redis = require("../config/redis");

// =================================================================
// HELPER — Create a rate limiter with Redis store
// =================================================================

const createLimiter = ({ windowMs, max, prefix, message }) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    store: new RedisStore({
      sendCommand: (...args) => redis.call(...args),
      prefix: `rl:${prefix}:`,
    }),
    message: {
      success: false,
      message: message || "Too many requests, please try again later",
    },
    // Let express-rate-limit handle IP extraction (supports IPv6 properly)
    // No custom keyGenerator needed — default uses req.ip
    validate: {
      xForwardedForHeader: false, // Disable X-Forwarded-For validation warning
    },
  });
};

// =================================================================
// AUTH LIMITER — For login, signup, OTP routes
// =================================================================
const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  prefix: "auth",
  message: "Too many authentication attempts, please try again after 15 minutes",
});

// =================================================================
// STRICT LIMITER — For contact form and other sensitive routes
// =================================================================
const strictLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  prefix: "strict",
  message: "Too many requests, please try again after 15 minutes",
});

// =================================================================
// API LIMITER — General rate limit for all API routes
// =================================================================
const apiLimiter = createLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  prefix: "api",
  message: "Too many requests, please slow down",
});

module.exports = { authLimiter, strictLimiter, apiLimiter };
