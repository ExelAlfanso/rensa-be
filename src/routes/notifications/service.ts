import { t } from "elysia";

import { Notification } from "./model";

export abstract class NotificationService {
  static async photoSaved({ body }: any) {
    const { actorId, recipientId, photoId, type } = body;
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
  }

  static async fetchNotifications({ query }: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const recipientId = query.userId as string;
    const data = await Notification.find({ recipientId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await Notification.countDocuments({ recipientId });
    return {
      success: true,
      message: "Notifications fetched",
      data: {
        data,
        page,
        total,
        hasMore: page * limit < total,
      },
    };
  }

  static async photoBookmarked({ body }: any) {
    // Implementasi mirip photoSaved, dengan type "photo_bookmarked"
  }
  static async photoCommented({ body }: any) {
    // Implementasi mirip photoSaved, dengan type "photo_commented"
  }
}
