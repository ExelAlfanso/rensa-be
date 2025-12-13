import { RedisClient } from "bun";

const client = new RedisClient("redis://localhost:6379");
export { client as redis };
