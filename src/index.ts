import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import mongoose from "mongoose";
import { registerUser, removeUser } from "./utils/ws";
// 1. Connect DB
await mongoose.connect(process.env.MONGODB_URI!);

const app = new Elysia()
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
    async open(ws: any) {
      const token = ws.data?.query?.token as string | undefined;

      const payload = await ws.data.jwt.verify(token);

      if (!payload) {
        ws.send?.({ error: "Invalid Token" });
        ws.close?.();
        return;
      }
      const userId = payload.sub;

      ws.data.userId = userId;

      registerUser(userId, ws);

      console.log(`✅ User ${userId} connected!`);
    },
    close(ws) {
      const userId = (ws.data as any).userId;
      if (userId) {
        removeUser(userId);
        console.log(`❌ User ${userId} disconnected`);
      }
    },
  })
  .listen(4000); // Run on port 4000 to avoid conflict with Next.js (3000)

console.log("🦊 Elysia running on port 4000");
