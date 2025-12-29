import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

// Create Redis client
const client = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError(err) {
    const targetErrors = ["READONLY", "ECONNRESET", "ETIMEDOUT"];
    if (targetErrors.some((targetError) => err.message.includes(targetError))) {
      return true;
    }
    return false;
  },
});

// Track connection status
let isConnected = false;

client.on("connect", () => {
  isConnected = true;
  console.log("Redis connected successfully");
});

client.on("ready", () => {
  isConnected = true;
  console.log("Redis ready");
});

client.on("error", (error) => {
  console.error("Redis connection error:", error.message);
  isConnected = false;
});

client.on("close", () => {
  console.warn("Redis connection closed");
  isConnected = false;
});

// Export both client and connection status
export { client as redis };
export const redisConnected = () => isConnected;
