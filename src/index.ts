import Elysia from "elysia";
import { NotificationController } from "./routes/notifications";
import { WebSocketController } from "./routes/ws";
import { EXIFController } from "./routes/exif";
import cors from "@elysiajs/cors";
export const app = new Elysia()
  .use(
    cors({
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )
  .get("/health", () => ({ status: "ok" }))
  .group("/api", (app) =>
    app.use(WebSocketController).use(NotificationController).use(EXIFController)
  )
  .listen({ port: process.env.PORT || 3002, hostname: "0.0.0.0" }, () =>
    console.log(
      `Server is running on http://0.0.0.0:${process.env.PORT || 3002}`
    )
  );

// Trigger CI/CD change
console.log("CI/CD Triggered");
