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
    const exists = await NotificationService.checkNotificationKey(key);
    if (exists) {
      return;
    } else {
      await NotificationService.setNotificationKey(key);
    }

    const ws = onlineUsers.get(notificationData.recipientId);

    const populatedData = await NotificationService.populateNotificationActor(
      notificationData
    );

    if (ws) {
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
    } else {
      console.log(`User ${notificationData.recipientId} is not online.`);
    }
  }
}
