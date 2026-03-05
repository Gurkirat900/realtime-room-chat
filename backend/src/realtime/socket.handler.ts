import { IncomingMessage } from "http"
import { WebSocket } from "ws"

import { verifyToken } from "../lib/jwt.js"
import type { AuthedSocket } from "./types.js"
import { socketRegistry } from "./socket.registry.js"
import { roomManager } from "./room.manager.js"
// import { attachMessageRouter } from "./message.router.js"
import type { JwtPayload } from "../middlewares/auth.middleware.js"

export function handleSocketConnection(ws: WebSocket, req: IncomingMessage) {
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

    // attachMessageRouter(socket)

    ws.on("close", () => {
      socketRegistry.remove(socket)
      roomManager.removeSocket(socket)
    })
  } catch (error) {
    console.error("WebSocket authentication failed:", error)
    ws.close()
  }
}