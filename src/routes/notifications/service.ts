import { Notification } from "./model";

import { WebSocketService } from "../ws/service";
import { api } from "../../utils/axios";

export abstract class NotificationService {
  static async photoSaved({ body }: any) {
    const { actorId, recipientId, photoId, type } = body;
    console.log("Creating photoSaved notification:", body);
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
    const notification = await Notification.create({
      actorId,
      recipientId,
      photoId,
      type,
      createdAt: new Date(),
    });
    WebSocketService.notifyUser(recipientId, notification);
    return {
      success: true,
      message: `Notification created (${type})`,
      data: { notification },
    };
  }

  static async fetchNotifications({ query }: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const recipientId = query.recipientId as string;
    const notifications = await Notification.find({ recipientId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const populatedNotifications = await Promise.all(
      notifications.map(async (n) => {
        const actorRes = await api.get(
          `http://localhost:3000/api/profile/${n.actorId}`
        );
        return { ...n.toObject(), actorId: actorRes.data.data.user };
      })
    );
    const total = await Notification.countDocuments({ recipientId });
    return {
      success: true,
      message: "Notifications fetched",
      data: {
        notifications: populatedNotifications,
        page,
        total,
        hasMore: page * limit < total,
      },
    };
  }
  static async clearNotifications({ body }: any) {
    const { recipientId } = body;
    if (!recipientId) {
      return {
        success: false,
        message: "recipientId is required",
      };
    }
    await Notification.deleteMany({ recipientId });
    return {
      success: true,
      message: "Notifications cleared",
    };
  }
  static async photoBookmarked({ body }: any) {
    // Implementasi mirip photoSaved, dengan type "photo_bookmarked"
  }
  static async photoCommented({ body }: any) {
    // Implementasi mirip photoSaved, dengan type "photo_commented"
  }
  static async populateNotificationActor(notification: any) {
    const actorRes = await api.get(
      `http://localhost:3000/api/profile/${notification.actorId}`
    );
    return { ...notification.toObject(), actorId: actorRes.data.data.user };
  }
}
