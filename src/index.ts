import Elysia from "elysia";
import { NotificationController } from "./routes/notifications";
import { WebSocketController } from "./routes/ws";
import { EXIFController } from "./routes/exif";
import cors from "@elysiajs/cors";
export const app = new Elysia({ prefix: "/api" })
  .use(cors({ origin: "http://localhost:3000" }))
  .use(WebSocketController)
  .use(NotificationController)
  .use(EXIFController)
  .listen(process.env.PORT || 3002, () =>
    console.log(
      `Server is running on http://localhost:${process.env.PORT || 3002}`
    )
  );
