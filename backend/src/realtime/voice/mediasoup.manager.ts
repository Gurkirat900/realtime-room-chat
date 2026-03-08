import * as mediasoup from "mediasoup";

class MediaSoupManager {
  private worker: mediasoup.types.Worker | null = null;
  private routers = new Map<string, mediasoup.types.Router>(); // VoiceChannelId->Router

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
}

export const mediaSoupManager = new MediaSoupManager();
