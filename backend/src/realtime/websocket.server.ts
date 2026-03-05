import {Server} from "http";  
import { WebSocketServer } from "ws";
import { handleSocketConnection } from "./socket.handler.js";

export function setupWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server });   // Attach WebSocket server to the existing HTTP server

    wss.on("connection", (ws, req) => {  // Listen for new WebSocket connections
      handleSocketConnection(ws, req);  // Delegate connection handling to the socket handler
    });

    console.log("WebSocket Server initialized");
}