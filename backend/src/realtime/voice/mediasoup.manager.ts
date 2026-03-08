import * as mediasoup from "mediasoup";
import type { AuthedSocket } from "../types.js";
import { env } from "../../config/env.js";

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
          // announcedIp: env.PUBLIC_IP! // add announceIp in prod here
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

    return producer.id;
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
}

export const mediaSoupManager = new MediaSoupManager();
