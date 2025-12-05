import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import mongoose from "mongoose";
import { WebSocketService } from "./service";
await mongoose.connect(process.env.MONGODB_URI!);

export const WebSocketController = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: process.env.NEXTAUTH_SECRET!,
    })
  )
  .ws("/ws", {
    query: t.Object({
      token: t.String(),
    }),
    data: {
      userId: "" as string,
    },
    open: WebSocketService.open,
    message: WebSocketService.message,
    close: WebSocketService.close,
  });
