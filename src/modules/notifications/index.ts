import { Elysia, t } from "elysia";
import { connectDB } from "../../utils/db";
import { Notification } from "../../models/notification";
await connectDB();

/*
  POST /notify/photo-saved
  Body: { actorId, recipientId, photoId }
  Creates a notification when a photo is saved by actorId for recipientId
*/

const NotificationType = t.Union([
  t.Literal("photo_saved"),
  t.Literal("photo_bookmarked"),
  t.Literal("photo_commented"),
]);

new Elysia().post(
  "/notifications",
  async ({ body }) => {
    const { actorId, recipientId, photoId, type } = body;
    if (NotificationType.includes(type) === false) {
      return {
        success: false,
        message: `Invalid notification type: ${type}`,
      };
    }
    if (actorId === recipientId) {
      return {
        success: false,
        message: "Actor and recipient cannot be the same",
      };
    }
    if (!actorId || !recipientId || !photoId) {
      return {
        success: false,
        message: "actorId, recipientId, and photoId are required",
      };
    }

    const notif = await Notification.create({
      actorId,
      recipientId,
      photoId,
      type,
      createdAt: new Date(),
    });

    return {
      success: true,
      message: `Notification created (${type})`,
      data: notif,
    };
  },
  {
    body: t.Object({
      actorId: t.String(),
      recipientId: t.String(),
      photoId: t.String(),
      type: NotificationType,
    }),
  }
);

/*
  GET /notifications/:userId?page=[page]&limit=[limit]
  Fetch notifications for a user with pagination
*/

new Elysia().get(
  "/notifications/:recipientId",
  async ({ query }) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const recipientId = query.userId as string;

    const data = await Notification.find({ recipientId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Notification.countDocuments({ recipientId });

    return {
      data,
      page,
      total,
      hasMore: page * limit < total,
    };
  },
  {
    query: t.Object({
      userId: t.String(), // user yang mau fetch notifikasi
      page: t.Optional(t.Numeric()),
      limit: t.Optional(t.Numeric()),
    }),
  }
);
