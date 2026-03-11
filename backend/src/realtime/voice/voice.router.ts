import type {
  AuthedSocket,
  ClientEvent,
  ConnectTransportEvent,
  ConsumeEvent,
  CreateTransportEvent,
  ProduceEvent,
  RawClientEvent,
} from "../types.js";
import { voiceManager } from "./voice.manager.js";
import { mediaSoupManager } from "./mediasoup.manager.js";

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

      console.log("WS EVENT:", parsedEvent);
      const event = parsedEvent as ClientEvent; // Cast the parsed event to the ClientEvent union type for type-safe handling
      console.log(event);
      switch (event.type) {
        case "VOICE_JOIN":
          handleJoin(socket, event.payload.voiceChannelId);
          break;

        case "VOICE_LEAVE":
          handleLeave(socket);
          break;

        case "VOICE_CREATE_TRANSPORT":
          handleCreateTransport(socket, event as CreateTransportEvent);
          break;

        case "VOICE_CONNECT_TRANSPORT":
          handleConnectTransport(socket, event as ConnectTransportEvent);
          break;

        case "VOICE_PRODUCE":
          handleProduce(socket, event as ProduceEvent);
          break;

        case "VOICE_GET_RTP_CAPABILITIES":
          handleGetRtpCapabilities(socket);
          break;

        case "VOICE_CONSUME":
          handleConsume(socket, event as ConsumeEvent);
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

async function handleJoin(socket: AuthedSocket, voiceChannelId: string) {
  const userId = socket.userId;

  const previousChannel = voiceManager.join(voiceChannelId, socket);

  if (previousChannel) {
    broadcastUserLeft(previousChannel, userId);
  }

  // create router if first user in channel
  await mediaSoupManager.getOrCreateRouter(voiceChannelId)
  const participants = voiceManager.getParticipants(voiceChannelId);

  socket.send(
    JSON.stringify({
      type: "VOICE_PARTICIPANTS", // show list of all participants in channel when new joins
      payload: {
        voiceChannelId,
        users: Array.from(participants).map((s) => ({
          userId: s.userId,
        })),
      },
    }),
  );

  const producerIds = mediaSoupManager.getProducersInChannel(voiceChannelId);

  socket.send(
    JSON.stringify({
      type: "VOICE_EXISTING_PRODUCERS", // send producer ids of exiting users in voice channel so client can  ake consumer for them
      payload: {
        producerIds,
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

  const remaining = voiceManager.getParticipants(channelId);
  if (remaining.size == 0) {
    mediaSoupManager.destroyRouter(channelId);
  }
}

async function handleCreateTransport(
  socket: AuthedSocket,
  event: CreateTransportEvent,
) {
  const channelId = voiceManager.getChannel(socket);
  if (!channelId) return;

  const params = await mediaSoupManager.createWebRtcTransport(
    socket,
    channelId,
    event.payload.direction,
  );

  socket.send(
    JSON.stringify({
      type: "VOICE_TRANSPORT_CREATED",
      payload: params,
    }),
  );
}

async function handleConnectTransport(
  socket: AuthedSocket,
  event: ConnectTransportEvent,
) {
  await mediaSoupManager.connectTransport(
    socket,
    event.payload.direction,
    event.payload.dtlsParameters,
  );
}

async function handleProduce(socket: AuthedSocket, event: ProduceEvent) {
  const producerId = await mediaSoupManager.produce(
    socket,
    event.payload.kind,
    event.payload.rtpParameters,
  );

  // Acknowledge producer creation to sender
  socket.send(
    JSON.stringify({
      type: "VOICE_PRODUCED",
      payload: { producerId },
    }),
  );

  // Notify other users in the same voice channel
  const channelId = voiceManager.getChannel(socket);
  if (!channelId) return;

  const participants = voiceManager.getParticipants(channelId);

  for (const peer of participants) {
    if (peer === socket) continue;

    peer.send(
      JSON.stringify({
        type: "VOICE_NEW_PRODUCER",
        payload: {
          producerId,
        },
      }),
    );
  }
}

function handleGetRtpCapabilities(socket: AuthedSocket) {
  try {
    console.log("inside getRTp capabilities");
    const channelId = voiceManager.getChannel(socket);
    if (!channelId) return;

    const rtpCapabilities =
      mediaSoupManager.getRouterRtpCapabilities(channelId);

    socket.send(
      JSON.stringify({
        type: "VOICE_ROUTER_RTP_CAPABILITIES",
        payload: { rtpCapabilities },
      }),
    );
  } catch (error: any) {
    console.log("Err mess", error.message);
  }
}

async function handleConsume(socket: AuthedSocket, event: ConsumeEvent) {
  const consumer = await mediaSoupManager.consume(
    socket,
    event.payload.producerId,
    event.payload.rtpCapabilities,
  );

  socket.send(
    JSON.stringify({
      type: "VOICE_CONSUMER_CREATED",
      payload: consumer,
    }),
  );
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
