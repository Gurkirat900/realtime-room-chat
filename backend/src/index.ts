import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  socket: WebSocket;
  room: string;
}

let allSockets: User[] = [];

wss.on("connection", (socket: WebSocket) => {
  socket.on("message", (message) => {
    // meassage is of type string
    // @ts-ignore
    const parsedMessage = JSON.parse(message); // Parse the incoming message to determine its type and payload

    if (parsedMessage.type === "join") {
      const user: User = { socket, room: parsedMessage.payload.roomId };
      allSockets.push(user);
      console.log(
        `User joined room: ${parsedMessage.payload.roomId}. Current user count: ${allSockets.length}`,
      );
    }

    if (parsedMessage.type === "chat") {
      allSockets.forEach((user) => {
        if (user.room === parsedMessage.payload.roomId) {
          user.socket.send(message); // Send the message to all users in the same room
        }
      });
    }

    socket.on("disconnect", () => {
      allSockets = allSockets.filter((user) => user.socket !== socket); // Remove the socket from the list
      console.log(`User disconnected. Current user count: ${allSockets.length}`);
    });
  });
});
