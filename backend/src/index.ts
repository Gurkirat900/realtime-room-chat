import "dotenv/config";
import app from "./app.js";
import http from "http"; // Import the built-in HTTP module to create a server
import { setupWebSocketServer } from "./realtime/websocket.server.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app); // Create an HTTP server using the Express app
setupWebSocketServer(server);   // Initialize the WebSocket server and attach it to the HTTP server

server.listen(PORT, () => {
  console.log(`HTTP Server running on port ${PORT}`);
});