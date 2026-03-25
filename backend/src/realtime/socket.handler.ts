import { IncomingMessage } from "http"
import { WebSocket } from "ws"
import { verifyToken } from "../lib/jwt.js"
import type { AuthedSocket } from "./types.js"
import { socketRegistry } from "./socket.registry.js"
import { roomManager } from "./room.manager.js"
import { attachMessageRouter } from "./message.router.js"
import type { JwtPayload } from "../middlewares/auth.middleware.js"
import { getUserActiveRooms } from "../modules/rooms/room.service.js"
import { attachVoiceRouter } from "./voice/voice.router.js"
import { voiceManager } from "./voice/voice.manager.js"
import { mediaSoupManager } from "./voice/mediasoup.manager.js"

export async function handleSocketConnection(ws: WebSocket, req: IncomingMessage) {
  try {
    const url = new URL(req.url || "", `http://${req.headers.host}`)
    const token = url.searchParams.get("token")

    if (!token) {
      ws.close()
      return
    }

    const decoded = verifyToken(token) as JwtPayload

    const socket = ws as AuthedSocket 
    socket.userId = decoded.userId

    socketRegistry.register(socket)

    // Auto subscribe rooms
    const userRooms= await getUserActiveRooms(socket.userId)
    if(userRooms.length>0){
        roomManager.subscribe(socket,userRooms)
    }

    attachMessageRouter(socket)
    attachVoiceRouter(socket)

    ws.on("close", () => {
      const channelId= voiceManager.getChannel(socket)

      socketRegistry.remove(socket)
      voiceManager.removeSocket(socket)
      roomManager.removeSocket(socket)
      mediaSoupManager.removeSocket(socket)

      // destroy router if no participants on leaving
      if(channelId){
        const remaining= voiceManager.getParticipants(channelId)
        if(remaining.size==0){
          mediaSoupManager.destroyRouter(channelId)
        }
      }
      
      console.log(`Socket disconnected for user: ${socket.userId}`)
    })
  } catch (error) {
    console.error("WebSocket authentication failed:", error)
    ws.close()
  }
}