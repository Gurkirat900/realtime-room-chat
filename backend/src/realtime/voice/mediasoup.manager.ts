import * as mediasoup from "mediasoup";
import type { AuthedSocket } from "../types.js";
import { voiceManager } from "./voice.manager.js";

class MediaSoupManager {
  private worker: mediasoup.types.Worker | null = null;
  private routers = new Map<string, mediasoup.types.Router>(); // VoiceChannelId->Router

  private transports = new Map<
    // socket->{sendAudio, receiveAudio}
    AuthedSocket,
    {
      sendTransport?: mediasoup.types.WebRtcTransport;
      recvTransport?: mediasoup.types.WebRtcTransport;
    }
  >();

  private producers = new Map<AuthedSocket, mediasoup.types.Producer>();
  private consumers = new Map<
    AuthedSocket,
    Map<string, mediasoup.types.Consumer>
  >(); // socket->(produverid,consumer)

  private readonly mediaCodecs: mediasoup.types.RtpCodecCapability[] = [
    {
      kind: "audio",
      mimeType: "audio/opus", // discord/webrtc uses opus
      clockRate: 48000,
      channels: 2, // stereo
      preferredPayloadType: 111, // unique for each type(audio/opus, video/v8 etc)
    },
  ];

  async init() {
    this.worker = await mediasoup.createWorker({
      rtcMinPort: 20000,
      rtcMaxPort: 20100,
    });

    this.worker.on("died", () => {
      console.error("mediasoup worker died");
      process.exit(1);
    });

    console.log("Mediasoup worker started");
  }

  async getOrCreateRouter(voiceChannelId: string) {
    let router = this.routers.get(voiceChannelId);

    if (router) return router;

    if (!this.worker) throw new Error("Worker not initialized");

    router = await this.worker.createRouter({
      mediaCodecs: this.mediaCodecs,
    });

    this.routers.set(voiceChannelId, router);
    console.log("Router created"); // remove later

    return router;
  }

  async createWebRtcTransport(
    socket: AuthedSocket,
    voiceChannelId: string,
    direction: "send" | "recv",
  ) {
    const router = await this.getOrCreateRouter(voiceChannelId);

    const transport = await router.createWebRtcTransport({
      listenIps: [
        {
          ip: "0.0.0.0",
          announcedIp: "127.0.0.1", // add announceIp in prod here (temp for now)
        },
      ],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    });

    let socketTransports = this.transports.get(socket);

    if (!socketTransports) {
      socketTransports = {};
      this.transports.set(socket, socketTransports);
    }

    if (direction === "send") {
      socketTransports.sendTransport = transport;
    } else {
      socketTransports.recvTransport = transport;
    }

    return {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    };
  }

  async connectTransport(
    socket: AuthedSocket,
    direction: "send" | "recv",
    dtlsParameters: mediasoup.types.DtlsParameters,
  ) {
    const socketTransports = this.transports.get(socket);

    if (!socketTransports) {
      throw new Error("No transports found for socket");
    }

    const transport =
      direction === "send"
        ? socketTransports.sendTransport
        : socketTransports.recvTransport;

    if (!transport) {
      throw new Error("Transport not found");
    }

    await transport.connect({ dtlsParameters });
  }

  async produce(
    socket: AuthedSocket,
    kind: mediasoup.types.MediaKind,
    rtpParameters: mediasoup.types.RtpParameters,
  ) {
    const socketTransports = this.transports.get(socket);

    if (!socketTransports?.sendTransport) {
      throw new Error("Send transport not found");
    }

    const producer = await socketTransports.sendTransport.produce({
      kind,
      rtpParameters,
    });

    this.producers.set(socket, producer);

    producer.on("transportclose", () => {
      producer.close();
      this.producers.delete(socket);
    });
    console.log("producer:", producer.paused);

    return producer.id;
  }

  async getRouterRtpCapabilities(channelId: string) {
    // for transport to be created at client side
    let router = this.routers.get(channelId);

    if (!router) {
      router = await this.getOrCreateRouter(channelId); // if not create one
    }

    return router.rtpCapabilities; // sending promise so await at handler
  }

  async consume(
    socket: AuthedSocket,
    producerId: string,
    rtpCapabilities: mediasoup.types.RtpCapabilities,
  ) {
    const socketTransports = this.transports.get(socket);

    if (!socketTransports?.recvTransport) {
      throw new Error("Recv transport not found");
    }

    const channelId = voiceManager.getChannel(socket);
    if (!channelId) {
      throw new Error("Socket not in voice channel");
    }
    const router = this.routers.get(channelId);
    if (!router) {
      throw new Error("Router not found for channel");
    }

    if (!router.canConsume({ producerId, rtpCapabilities })) {
      throw new Error("Client cannot consume this producer");
    }

    let socketConsumers = this.consumers.get(socket);

    if (!socketConsumers) {
      socketConsumers = new Map();
      this.consumers.set(socket, socketConsumers);
    }

    //  Check if consumer already exists
    if (socketConsumers.has(producerId)) {
      console.log("Consumer already exists for:", producerId);

      const existing = socketConsumers.get(producerId)!;

      return {
        id: existing.id,
        producerId,
        kind: existing.kind,
        rtpParameters: existing.rtpParameters,
      };
    }

    const consumer = await socketTransports.recvTransport.consume({
      producerId,
      rtpCapabilities,
      paused: true,
    });

    socketConsumers.set(producerId, consumer); // will set this.consumer too => map are set by refernce

    console.log("consumer before reuming", consumer.paused);

    consumer.on("transportclose", () => {
      consumer.close();
    });

    return {
      id: consumer.id,
      producerId,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
    };
  }

  async resumeConsumer(socket: AuthedSocket, consumerId: string) {
    const socketConsumers = this.consumers.get(socket);
    if (!socketConsumers) return;

    const consumer = socketConsumers.get(consumerId);

    if (!consumer) {
      console.warn("Consumer not found:", consumerId);
      return;
    }

    if (!consumer.paused) {
      console.log("Consumer already resumed:", consumerId);
      return;
    }

    await consumer.resume();

    console.log("consumer resumed:", consumerId);
  }

  // send list of exiting users in voice channel to new client
  getProducersInChannel(channelId: string): string[] {
    const ids: string[] = [];

    for (const [socket, producer] of this.producers) {
      const userChannel = voiceManager.getChannel(socket);

      if (userChannel === channelId) {
        ids.push(producer.id);
      }
    }

    return ids;
  }

  removeSocket(socket: AuthedSocket) {
    const producer = this.producers.get(socket);
    if (producer) {
      producer.close();
      this.producers.delete(socket);
    }
    const socketTransports = this.transports.get(socket);

    if (!socketTransports) return;

    socketTransports.sendTransport?.close();
    socketTransports.recvTransport?.close();

    this.transports.delete(socket);
  }

  destroyRouter(channelId: string) {
    // when all user leaves voice channel
    const router = this.routers.get(channelId);

    if (!router) return;

    router.close();

    this.routers.delete(channelId);

    console.log(`Router destroyed for voice channel ${channelId}`);
  }
}

export const mediaSoupManager = new MediaSoupManager();
