import type { AuthedSocket, ClientEvent, RawClientEvent } from "../types.js";
import { voiceManager } from "./voice.manager.js";

export function attachVoiceRouter(socket: AuthedSocket) {
  socket.on("message", (data) => {
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
        case "VOICE_JOIN":
          handleJoin(socket, event.payload.voiceChannelId);
          break;

        case "VOICE_LEAVE":
          handleLeave(socket);
          break;
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



function handleJoin(socket: AuthedSocket, voiceChannelId: string) {
  const userId = socket.userId;

  const previousChannel = voiceManager.join(voiceChannelId, socket);

  if (previousChannel) {
    broadcastUserLeft(previousChannel, userId);
  }

  const participants = voiceManager.getParticipants(voiceChannelId);

  socket.send(
    JSON.stringify({
      type: "VOICE_PARTICIPANTS",
      payload: {
        voiceChannelId,
        users: Array.from(participants).map((s) => ({
          userId: s.userId,
        })),
      },
    }),
  );

  broadcastUserJoined(voiceChannelId, userId, socket);
}

function handleLeave(socket: AuthedSocket) {
  const channelId = voiceManager.getChannel(socket);

  if (!channelId) return;

  voiceManager.leave(socket);

  broadcastUserLeft(channelId, socket.userId);
}

function broadcastUserJoined(
  channelId: string,
  userId: string,
  exclude: AuthedSocket,
) {
  const sockets = voiceManager.getParticipants(channelId);

  for (const socket of sockets) {
    if (socket === exclude) continue;

    socket.send(
      JSON.stringify({
        type: "VOICE_USER_JOINED",
        payload: {
          voiceChannelId: channelId,
          userId,
        },
      }),
    );
  }
}

function broadcastUserLeft(channelId: string, userId: string) {
  const sockets = voiceManager.getParticipants(channelId);

  for (const socket of sockets) {
    socket.send(
      JSON.stringify({
        type: "VOICE_USER_LEFT",
        payload: {
          voiceChannelId: channelId,
          userId,
        },
      }),
    );
  }
}
