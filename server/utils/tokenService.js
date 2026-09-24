const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const redis = require("../config/redis");
require("dotenv").config();

const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_TOKEN_TTL = parseInt(process.env.REFRESH_TOKEN_TTL) || 7 * 24 * 60 * 60; // 7 days in seconds

// =================================================================
// ACCESS TOKEN (JWT — short-lived)
// =================================================================

/**
 * Generate a signed JWT access token
 * @param {Object} payload - { email, id, accountType }
 * @returns {string} Signed JWT
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

// =================================================================
// REFRESH TOKEN (UUID — stored in Redis)
// =================================================================

/**
 * Generate a refresh token and store it in Redis
 * @param {string} userId - MongoDB user ID
 * @param {string} accountType - "Patient" | "Doctor" | "Admin"
 * @returns {Promise<string>} The refresh token UUID
 */
const generateRefreshToken = async (userId, accountType) => {
  const refreshToken = uuidv4();
  const key = `refresh:${refreshToken}`;
  const value = JSON.stringify({ userId, accountType });

  // Store in Redis with TTL
  await redis.set(key, value, "EX", REFRESH_TOKEN_TTL);

  return refreshToken;
};

/**
 * Verify a refresh token by looking it up in Redis
 * @param {string} token - The refresh token UUID
 * @returns {Promise<Object|null>} { userId, accountType } or null if invalid/expired
 */
const verifyRefreshToken = async (token) => {
  const key = `refresh:${token}`;
  const data = await redis.get(key);

  if (!data) return null;

  return JSON.parse(data);
};

/**
 * Revoke (delete) a refresh token from Redis
 * @param {string} token - The refresh token UUID
 * @returns {Promise<void>}
 */
const revokeRefreshToken = async (token) => {
  const key = `refresh:${token}`;
  await redis.del(key);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
};
