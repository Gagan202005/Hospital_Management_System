const Redis = require("ioredis");
require("dotenv").config();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.error("❌ REDIS_URL is not set in environment variables");
  process.exit(1);
}

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 5000);
    return delay;
  },
});

redis.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

redis.on("error", (err) => {
  console.error("❌ Redis connection error:", err.message);
});

redis.on("reconnecting", () => {
  console.log("🔄 Redis reconnecting...");
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  await redis.quit();
  console.log("Redis connection closed");
});

module.exports = redis;
