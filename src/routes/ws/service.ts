import { NotificationService } from "../notifications/service";

export const onlineUsers = new Map<string, any>();

export abstract class WebSocketService {
  static async open(ws: any) {
    const token = ws.data.query.token;

    try {
      const payload = await ws.data.jwt.verify(token);
      const userId = payload.id;

      ws.data.userId = userId;

      WebSocketService.registerUser(userId, ws);

      console.log(`✅ User ${userId} connected!`);
    } catch (err) {
      throw { success: false, message: "WebSocket authentication failed" };
    }
  }
  static close(ws: any) {
    const userId = (ws.data as any).userId;
    if (userId) {
      WebSocketService.removeUser(userId);
      console.log(`❌ User ${userId} disconnected`);
    }
  }
  static registerUser(userId: string, ws: any) {
    onlineUsers.set(userId, ws);
  }
  static removeUser(userId: string) {
    onlineUsers.delete(userId);
  }
  static async notifyUser(notificationData: any) {
    const key = `notifications:${notificationData.recipientId}:${notificationData.actorId}:${notificationData.photoId}:${notificationData.type}`;
    // console.log(`[WS] Checking for duplicate notification with key: ${key}`);
    const exists = await NotificationService.checkNotificationKey(key);
    if (exists) {
      // console.log(`[WS] ⚠️  Duplicate notification detected, skipping send`);
      return;
    } else {
      // console.log(`[WS] No duplicate found, setting notification key`);
      await NotificationService.setNotificationKey(key);
    }

    const ws = onlineUsers.get(notificationData.recipientId);
    // console.log(`[WS] Checking if recipient ${notificationData.recipientId} is online: ${ws ? '✅ Yes' : '❌ No'}`);

    // console.log(`[WS] Populating notification actor data...`);
    const populatedData = await NotificationService.populateNotificationActor(
      notificationData
    );
    // console.log(`[WS] ✅ Actor data populated for user: ${populatedData.actorId.username}`);

    if (ws) {
      // console.log(`[WS] Sending notification to recipient ${notificationData.recipientId}...`);
      ws.send(
        JSON.stringify({
          id: populatedData._id.toString(),
          recipientId: populatedData.recipientId,
          actorId: {
            id: populatedData.actorId._id.toString(),
            username: populatedData.actorId.username,
            avatar: populatedData.actorId.avatar ?? null,
          },
          photoId: populatedData.photoId,
          type: populatedData.type,
          message: populatedData.message,
          createdAt: populatedData.createdAt,
        })
      );
      // console.log(`[WS] ✅ Notification sent successfully via WebSocket`);
    } else {
      // console.log(`[WS] ⚠️  User ${notificationData.recipientId} is not online, notification saved to database only`);
    }
  }
}
