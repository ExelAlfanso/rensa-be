export const onlineUsers = new Map<string, any>();

export abstract class WebSocketService {
  static async open(ws: any) {
    const token = ws.data?.query?.token as string | undefined;

    const payload = await ws.data.jwt.verify(token);

    if (!payload) {
      ws.send?.({ error: "Invalid Token" });
      ws.close?.();
      return;
    }
    const userId = payload.sub;

    ws.data.userId = userId;

    WebSocketService.registerUser(userId, ws);

    console.log(`✅ User ${userId} connected!`);
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
  static notifyUser(actorId: string, recipientId: string, data: any) {
    const ws = onlineUsers.get(recipientId);
    if (ws) ws.send(JSON.stringify(data));
  }
}
