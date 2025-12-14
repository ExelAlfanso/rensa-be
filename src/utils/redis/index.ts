import { RedisClient } from "bun";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const client = new RedisClient(redisUrl);

// Try to connect to Redis
let isConnected = false;
client
  .connect()
  .then(() => {
    isConnected = true;
    console.log("🟢 Redis connected");
  })
  .catch((error) => {
    console.error("⚠️  Redis connection error:", error.message);
    console.log("ℹ️  Continuing without Redis (some features may be limited)");
    isConnected = false;
  });

// Export both client and connection status
export { client as redis };
export const redisConnected = () => isConnected;
