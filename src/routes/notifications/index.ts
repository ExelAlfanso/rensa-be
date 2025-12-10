import { Elysia, t } from "elysia";
import { connectDB } from "../../utils/db";
import { NotificationService } from "./service";
await connectDB();

export const NotificationController = new Elysia()
  /*
  POST /notifications/photo-saved
  Body: { actorId, recipientId, photoId }
  Creates a notification when a photo is saved by actorId for recipientId
*/
  .post(
    "/notifications/photo-saved",
    async ({ body }) => {
      return await NotificationService.photoSaved({ body });
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
    async ({ query }) => {
      return await NotificationService.fetchNotifications({ query });
    },
    {
      query: t.Object({
        recipientId: t.String(), // user yang mau fetch notifikasi
        page: t.Optional(t.Numeric()),
        limit: t.Optional(t.Numeric()),
      }),
    }
  );
