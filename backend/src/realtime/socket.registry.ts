import type { AuthedSocket } from "./types.js"

class SocketRegistry {
  private userSockets: Map<string, AuthedSocket> = new Map() 
  private socketUsers: Map<AuthedSocket, string> = new Map()

  register(socket: AuthedSocket) {
    const { userId } = socket  // Extract userId from the socket, which should have been set during authentication

    this.userSockets.set(userId, socket)
    this.socketUsers.set(socket, userId)
  }

  remove(socket: AuthedSocket) {
    const userId = this.socketUsers.get(socket)

    if (!userId) return

    this.userSockets.delete(userId)
    this.socketUsers.delete(socket)
  }

  getSocket(userId: string): AuthedSocket | undefined {
    return this.userSockets.get(userId)
  }

  getUserId(socket: AuthedSocket): string | undefined {
    return this.socketUsers.get(socket)
  }
}

// Export a singleton instance of the SocketRegistry to be used throughout the application
export const socketRegistry = new SocketRegistry()