import type { AuthedSocket } from "./types.js";

class SocketRegistry {
  private userSockets: Map<string, Set<AuthedSocket>> = new Map();
  private socketUsers: Map<AuthedSocket, string> = new Map();

  register(socket: AuthedSocket) {
    const { userId } = socket; // Extract userId from the socket, which should have been set during authentication

    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }

    this.userSockets.get(userId)?.add(socket);
    this.socketUsers.set(socket, userId);
  }

  remove(socket: AuthedSocket) {
    const userId = this.socketUsers.get(socket);

    if (!userId) return;
    const sockets = this.userSockets.get(userId);

    if (sockets) {
      sockets.delete(socket);

      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }

    this.socketUsers.delete(socket);
  }

  getUsersSockets(userId: string): Set<AuthedSocket>{
    return this.userSockets.get(userId) ?? new Set()
  }

  getUserId(socket: AuthedSocket): string | undefined {
    return this.socketUsers.get(socket);
  }
}

// Export a singleton instance of the SocketRegistry to be used throughout the application
export const socketRegistry = new SocketRegistry();
