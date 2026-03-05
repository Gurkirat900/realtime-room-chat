import type { AuthedSocket, ServerEvent } from "./types.js"

class RoomManager {
  private roomSockets: Map<string, Set<AuthedSocket>> = new Map() // Map of room IDs to sets of sockets subscribed to those rooms
  private socketRooms: Map<AuthedSocket, Set<string>> = new Map() // Map of sockets to sets of room IDs they are subscribed to

  subscribe(socket: AuthedSocket, roomIds: string[]) {
    for (const roomId of roomIds) {
      if (!this.roomSockets.has(roomId)) {  // If the room doesn't have an entry in the roomSockets map, create a new Set for it
        this.roomSockets.set(roomId, new Set())
      }

      const sockets = this.roomSockets.get(roomId)
      if (sockets) {
        sockets.add(socket)
      }

      if (!this.socketRooms.has(socket)) {  // If the socket doesn't have an entry in the socketRooms map, create a new Set for it
        this.socketRooms.set(socket, new Set())
      }

      const rooms = this.socketRooms.get(socket)
      if (rooms) {
        rooms.add(roomId)
      }
    }
  }

  unsubscribe(socket: AuthedSocket, roomId: string) {
    const sockets = this.roomSockets.get(roomId)

    if (sockets) {
      sockets.delete(socket)  

      if (sockets.size === 0) {
        this.roomSockets.delete(roomId)  // If no more sockets are subscribed to this room, remove the room from the roomSockets map
      }
    }

    const rooms = this.socketRooms.get(socket)

    if (rooms) {
      rooms.delete(roomId)

      if (rooms.size === 0) {
        this.socketRooms.delete(socket) 
      }
    }
  }

  broadcast(roomId: string, event: ServerEvent) {
    const sockets = this.roomSockets.get(roomId)

    if (!sockets) return

    const message = JSON.stringify(event) // Convert the event object to a JSON string for transmission

    for (const socket of sockets) {
      if (socket.readyState === socket.OPEN) {
        socket.send(message)
      }
    }
  }

  removeSocket(socket: AuthedSocket) {
    const rooms = this.socketRooms.get(socket) // Get the set of rooms that this socket is subscribed to

    if (!rooms) return

    // For each room that this socket is subscribed to, get the set of sockets subscribed to that room and remove this socket from the set
    for (const roomId of rooms) {
      const sockets = this.roomSockets.get(roomId) 

      if (sockets) {
        sockets.delete(socket)

        if (sockets.size === 0) {
          this.roomSockets.delete(roomId)
        }
      }
    }

    this.socketRooms.delete(socket) // Finally, remove the socket from the socketRooms map since it's no longer subscribed to any rooms
  }
}

export const roomManager = new RoomManager()