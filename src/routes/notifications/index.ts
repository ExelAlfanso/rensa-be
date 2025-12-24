import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { NotificationService } from "./service";

export const NotificationController = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: process.env.NEXTAUTH_SECRET!,
    })
  )
  .derive(async ({ jwt, headers }) => {
    const auth = headers.authorization;
    if (!auth) return {};

    const token = auth.replace("Bearer ", "");
    const payload = await jwt.verify(token);

    if (!payload) return {};

    return {
      user: payload, // ⬅️ ini penting
    };
  })
  /*
  POST /notifications
  Body: { actorId, recipientId, photoId,type}
  Creates a notification when a photo is saved by actorId for recipientId
*/
  .post(
    "/notifications",
    async ({ user, body }) => {
      if (!user) return { success: false, message: "Unauthorized" };

      return await NotificationService.notify({ user, body });
    },
    {
      body: t.Object({
        actorId: t.String(),
        recipientId: t.String(),
        photoId: t.String(),
        type: t.String(),
      }),
    }
  )
  // /*
  //   GET /notifications?recipientId=&page=&limit=
  //   Fetch notifications for a user with pagination
  // */
  .get(
    "/notifications",
    async ({ user, query }) => {
      if (!user) return { success: false, message: "Unauthorized" };
      return await NotificationService.fetchNotifications({
        query: { ...query, recipientId: user.id },
      });
    },
    {
      query: t.Object({
        recipientId: t.String(), // user yang mau fetch notifikasi
        page: t.Optional(t.Numeric()),
        limit: t.Optional(t.Numeric()),
      }),
    }
  )
  .put(
    "/notifications/:id/read",
    async ({ params }) => {
      return await NotificationService.markNotificationAsRead(params.id);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  .delete(
    "/notifications/:userId",
    async ({ params }) => {
      return await NotificationService.clearNotifications({ params });
    },
    {
      params: t.Object({
        userId: t.String(),
      }),
    }
  );
