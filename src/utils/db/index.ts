import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let isConnected = false;

function buildMongoUri(): string {
  const base = process.env.MONGODB_URI;

  if (!base) throw new Error("MONGODB_URI not defined in .env");

  const isBunWinSrv =
    !!process.versions.bun &&
    process.platform === "win32" &&
    base.startsWith("mongodb+srv://");

  if (!isBunWinSrv) return base;

  const seedHosts = process.env.MONGODB_SEED_HOSTS;
  if (!seedHosts)
    throw new Error(
      "MONGODB_SEED_HOSTS required on Windows+Bun when using mongodb+srv"
    );

  const url = new URL(base);
  const dbName = url.pathname.replace(/^\//, "");
  const credentials = url.username
    ? `${decodeURIComponent(url.username)}:${decodeURIComponent(url.password)}@`
    : "";

  // Carry over query params and enforce TLS; allow replicaSet override via env
  const params = new URLSearchParams(url.search);
  if (process.env.MONGODB_REPLICA_SET)
    params.set("replicaSet", process.env.MONGODB_REPLICA_SET);
  params.set("tls", "true");

  const query = params.toString();
  const directUri = `mongodb://${credentials}${seedHosts}/${dbName}${
    query ? `?${query}` : ""
  }`;

  console.warn(
    "Using direct MongoDB URI due to Bun+Windows SRV limitation:",
    directUri
  );

  return directUri;
}

export async function connectDB() {
  if (isConnected) return;

  const uri = buildMongoUri();
  if (process.env.NODE_ENV !== "production") {
    console.log("BUN VERSION:", process.versions.bun);
    console.log("NODE ENV:", process.env.NODE_ENV);
    console.log("MONGO URI EXISTS:", !!uri);
    console.log("MONGO URI:", uri);
  }

  try {
    const db = await mongoose.connect(uri);
    isConnected = db.connections[0].readyState === 1;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("  MongoDB connection error", err);
    throw err;
  }
}
