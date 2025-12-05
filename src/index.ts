import Elysia from "elysia";
import { NotificationController } from "./routes/notifications";
import { WebSocketController } from "./routes/ws";
import { EXIFController } from "./routes/exif";

export const app = new Elysia()
  .use(WebSocketController)
  .use(NotificationController)
  .use(EXIFController)
  .listen(4000, () =>
    console.log("Server is running on http://localhost:4000")
  );
