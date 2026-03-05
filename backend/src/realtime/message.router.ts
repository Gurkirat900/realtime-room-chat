import type {
  AuthedSocket,
  SendMessageEvent,
  RawClientEvent,
  ClientEvent,
} from "./types.js";
import { roomManager } from "./room.manager.js";
import { createMessage } from "../modules/messages/message.service.js";


// Handler for processing incoming messages from clients
export function attachMessageRouter(socket: AuthedSocket) {
  socket.on("message", async (data) => {
    try {
      const parsedEvent = JSON.parse(data.toString()) as RawClientEvent;
      if (!parsedEvent.type) {
        socket.send(
          JSON.stringify({
            type: "ERROR",
            message: "Event type is required",
          }),
        );
        return;
      }

      const event = parsedEvent as ClientEvent; // Cast the parsed event to the ClientEvent union type for type-safe handling

      switch (event.type) {
        
        case "SEND_MESSAGE":
          await handleSendMessage(socket, event as SendMessageEvent);
          break;

        default:
          socket.send(
            JSON.stringify({
              type: "ERROR",
              message: "Unknown event type",
            }),
          );
      }
    } catch (error) {
      socket.send(
        JSON.stringify({
          type: "ERROR",
          message: "Invalid message format",
        }),
      );
    }
  });
}


// Handler for processing SEND_MESSAGE events from clients, allowing them to send chat messages to a specific room
async function handleSendMessage(
  socket: AuthedSocket,
  event: SendMessageEvent,
) {
  const { roomId, content } = event;

  if (!roomId || !content) {
    socket.send(
      JSON.stringify({
        type: "ERROR",
        message: "Invalid SEND_MESSAGE payload",
      }),
    );
    return;
  }

  try {
    // Create a new message in the database and broadcast it to all clients subscribed to the room
    const message = await createMessage(socket.userId, roomId, content);

    roomManager.broadcast(roomId, {
      type: "NEW_MESSAGE",
      roomId,
      message,
    });
  } catch (error: any) {
    socket.send(
      JSON.stringify({
        type: "ERROR",
        message: error.message || "Failed to send message",
      }),
    );
  }
}
