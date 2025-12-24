import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const api = axios.create({
  // Default to the frontend service name inside docker network
  baseURL:
    process.env._NEXT_PUBLIC_API_BASE_URL || "http://rensa-frontend:3000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
export { api };
