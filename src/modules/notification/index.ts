import { Elysia, t } from "elysia";
import { connectDB } from "../../utils/db";
import { registerUser, removeUser } from "../../utils/ws";

await connectDB();

new Elysia().post("/notify/photo-saved", async ({ body }) => body, {
  body: t.Object({
    recipientId: t.String(),
    actorId: t.String(),
    photoId: t.String(),
  }),
});
