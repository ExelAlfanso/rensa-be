import { NotificationService } from "../notifications/service";

export const onlineUsers = new Map<string, any>();

export abstract class WebSocketService {
  static async open(ws: any) {
    // console.log("WS DATA:", ws.data.query);
    const token = ws.data.query.token;

    try {
      const payload = await ws.data.jwt.verify(token);
      // console.log("WS PAYLOAD:", payload);
      const userId = payload.id;

      ws.data.userId = userId;

      WebSocketService.registerUser(userId, ws);

      console.log(`✅ User ${userId} connected!`);
    } catch (err) {
      console.error("WebSocket authentication error:", err);
      ws.send?.(JSON.stringify({ error: "Authentication Error" }));
      ws.close?.();
      return;
    }
  }
  // static message(ws: any, message: any) {
  //   WebSocketService.notifyUser(message.recipientId, message);
  //   console.log(`📩 Message from : ${ws.data.userId}`, message);
  // }
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
  static async notifyUser(recipientId: string, data: any) {
    const ws = onlineUsers.get(recipientId);
    const populatedData = await NotificationService.populateNotificationActor(
      data
    );
    console.log("Notifying user:", recipientId, populatedData);
    if (ws) {
      ws.send?.(JSON.stringify(populatedData));
    } else {
      console.log(`User ${recipientId} is not online.`);
    }
  }
}
