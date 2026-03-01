import { WebSocket } from "ws";

export const rooms = new Map<string, Set<WebSocket>>(); // Map of roomId to set of WebSocket clients

export function joinRoom(roomId: string, socket: WebSocket) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  rooms.get(roomId)!.add(socket);
}

export function leaveAllRooms(socket: WebSocket) {
  for (const [roomId, clients] of rooms.entries()) {
    clients.delete(socket);
    if (clients.size === 0) {
      rooms.delete(roomId);
    }
  }
}

export function broadcastToRoom(roomId: string, message: string) {
  const clients = rooms.get(roomId);
  if (!clients) return;

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}