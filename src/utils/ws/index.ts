import { ElysiaWS } from "elysia/dist/ws";

export const onlineUsers = new Map<string, any>();

export const registerUser = (userId: string, ws: any) => {
  onlineUsers.set(userId, ws);
};

export const removeUser = (userId: string) => {
  onlineUsers.delete(userId);
};

export const notifyUser = (actorId: string, recipientId: string, data: any) => {
  const ws = onlineUsers.get(recipientId);
  if (ws) ws.send(JSON.stringify(data));
};
