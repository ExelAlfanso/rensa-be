import { Notification } from "./model";

import { WebSocketService } from "../ws/service";
import { api } from "../../utils/axios";
import { redis, redisConnected } from "../../utils/redis";

//TODO: implement read notifications
export abstract class NotificationService {
  static async fetchNotifications({ query }: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
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
        return { ...n.toObject(), id: n._id, actorId: actorRes.data.data.user };
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
  static async clearNotifications({ params }: any) {
    const { userId } = params;

    if (!userId) {
      return {
        success: false,
        message: "userId is required",
      };
    }

    try {
      const res = await Notification.deleteMany({ recipientId: userId });
      return {
        success: true,
        message: "Notifications cleared",
        data: {
          notifications: res,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to clear notifications",
      };
    }
  }
  static async notify({ user, body }: any) {
    const actorId = user.id;
    console.log("actor authorized!", actorId);
    const { recipientId, photoId, type } = body;
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
    try {
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
      return {
        success: false,
        message: "Failed to create notification",
      };
    }
  }

  static async checkNotificationKey(notificationKey: string) {
    try {
      // Check if Redis is connected
      if (!redisConnected()) {
        console.warn("Redis not connected, skipping duplicate check");
        return false; // Allow notification if Redis is down
      }
      const exists = await redis.get(notificationKey);
      // console.log(
      //   "Checking notification key:",
      //   notificationKey,
      //   exists !== null
      // );
      return exists !== null;
    } catch (error) {
      console.error("Redis error:", error);
      return false; // Allow notification if Redis check fails
    }
  }
  static async setNotificationKey(notificationKey: string) {
    console.log("Setting notification key:", notificationKey);
    try {
      if (!redisConnected()) {
        console.warn("Redis not connected, skipping key set");
        return false;
      }
      await redis.set(notificationKey, "1", "EX", 60);
      return true;
    } catch (error) {
      console.error("Redis error:", error);
      return false;
    }
  }
  static async markNotificationAsRead(notificationId: string) {
    try {
      await Notification.findByIdAndUpdate(notificationId, { read: true });
    } catch (error) {
      console.error("Database error:", error);
      return false;
    }
    return true;
  }

  static async populateNotificationActor(notification: any) {
    const actorRes = await api.get(`/profile/${notification.actorId}`);
    return { ...notification.toObject(), actorId: actorRes.data.data.user };
  }
}
