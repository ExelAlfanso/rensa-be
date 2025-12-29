import { Notification } from "./model";

import { WebSocketService } from "../ws/service";
import { api } from "../../utils/axios";
import { redis, redisConnected } from "../../utils/redis";
import { connectDB } from "../../utils/db";

export abstract class NotificationService {
  static async fetchNotifications({ query }: any) {
    await connectDB();
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const recipientId = query.recipientId as string;
    const notifications = await Notification.find({ recipientId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
      // console.log(`[NotificationService] Fetched ${notifications.length} notifications for recipient ${recipientId}`);
      const populatedNotifications = await Promise.all(
      notifications.map(async (n) => {
        try {
          const actorRes = await api.get(`/profile/${n.actorId}`);
          // console.log(`[NotificationService] Fetched actor profile for ${n.actorId}: ${actorRes.data.data.user.username}`);
          return {
            ...n.toObject(),
            id: n._id,
            actorId: actorRes.data.data.user,
          };
        } catch (error) {
          throw {
            success: false,
            message: `Failed to fetch populatedNotifications' actor profile for ${n.actorId}`,
            error: error,
          };
        }
      })
    );
    if(!populatedNotifications){
      throw {
        success: false,
        message: `No notifications found for recipient ${recipientId}`,
      };
    }
    const total = await Notification.countDocuments({ recipientId });
    return {
      success: true,
      status: 200,
      message: "Notifications fetched",
      data: {
        notifications: populatedNotifications,
        page,
        total,
        hasMore: page * limit < total,
      },
    };
  }
  static async clearNotifications({ params }: any) {
    const { userId } = params;

    if (!userId) {
      return {
        success: false,
        status: 400,
        message: "userId is required",
      };
    }

    try {
      await connectDB();
      const res = await Notification.deleteMany({ recipientId: userId });
      return {
        success: true,
        status: 200,
        message: "Notifications cleared",
        data: {
          notifications: res,
        },
      };
    } catch (error) {
      return {
        success: false,
        status: 500,
        message: "Failed to clear notifications",
      };
    }
  }
  static async notify({ user, body }: any) {
    const actorId = user.id;
    const { recipientId, photoId, type } = body;
    if (actorId === recipientId) {
      throw {
        success: false,
        message: "Cannot notify yourself",
      };
    }
    if (!actorId || !recipientId || !photoId) {
      throw {
        success: false,
        message: "Missing required fields",
      };
    }
    if (
      type !== "photo-saved" &&
      type !== "photo-bookmarked" &&
      type !== "photo-commented"
    ) {
      throw {
        success: false,
        message: "Invalid notification type",
      };
    }
    try {
      await connectDB();
      const notification = await Notification.create({
        actorId,
        recipientId,
        photoId,
        type,
        createdAt: new Date(),
      });
      await WebSocketService.notifyUser(notification);
      return {
        success: true,
        message: `Notification created (${type})`,
        data: { notification },
      };
    } catch (error) {
      throw {
        success: false,
        message: "Failed to create notification",
      };
    }
  }

  static async checkNotificationKey(notificationKey: string) {
    try {
      if (!redisConnected()) {
        console.warn("Redis not connected, skipping duplicate check");
        return false;
      }
      const exists = await redis.get(notificationKey);

      return exists !== null;
    } catch (error) {
      throw { success: false, message: "Failed to check notification key" };
    }
  }
  static async setNotificationKey(notificationKey: string) {
    // console.log("Setting notification key:", notificationKey);
    try {
      if (!redisConnected()) {
        console.warn("Redis not connected, skipping key set");
        return false;
      }
      await redis.set(notificationKey, "1", "EX", 60);
      return true;
    } catch (error) {
      throw { success: false, message: "Failed to set notification key" };
    }
  }
  static async markNotificationAsRead(notificationId: string) {
    try {
      await Notification.findByIdAndUpdate(notificationId, { read: true });
    } catch (error) {
      throw { success: false, message: "Failed to mark notification as read" };
    }
    return true;
  }

  static async populateNotificationActor(notification: any) {
    try {
      const actorRes = await api.get(`/profile/${notification.actorId}`);
      return { ...notification.toObject(), actorId: actorRes.data.data.user };
    } catch (error) {
      throw {
        success: false,
        message: `Failed to fetch actor profile for ${notification.actorId}`,
      };
    }
  }
}
