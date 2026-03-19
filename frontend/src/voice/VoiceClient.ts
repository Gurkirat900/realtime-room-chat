import { deviceManager } from "@/core/mediasoup/deviceManager";
import { transportManager } from "@/core/mediasoup/transportManager";
import { producerManager } from "@/core/mediasoup/producerManager";
import { consumerManager } from "@/core/mediasoup/consumerManager";

type TransportDirection = "send" | "recv";

export class VoiceClient {
  private socket: WebSocket;

  private pendingConnectCallbacks: Partial<
    Record<TransportDirection, Function>
  > = {};

  private pendingProduceCallback: Function | null = null;

  private shouldConsume = false; // used when new user tries to consume a  producer but device hasnt loaded yet

  constructor(socket: WebSocket) {
    this.socket = socket;

    this.socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      this.handleSocketEvent(msg);
    };
  }

  // Public Apis=>
  joinChannel(voiceChannelId: string) {
    this.socket.send(
      JSON.stringify({
        type: "VOICE_JOIN",
        payload: { voiceChannelId },
      }),
    );
  }

  leaveChannel() {
    this.socket.send(
      JSON.stringify({
        type: "VOICE_LEAVE",
      }),
    );
  }

  private async handleSocketEvent(event: any) {
    switch (event.type) {
      case "VOICE_PARTICIPANTS":
        this.requestRtpCapabilities();
        break;

      case "VOICE_ROUTER_RTP_CAPABILITIES":
        this.handleRouterCapabilities(event);
        break;

      case "VOICE_TRANSPORT_CREATED":
        this.handleTransportCreated(event);
        break;

      case "VOICE_TRANSPORT_CONNECTED":
        this.handleTransportConnected(event);
        break;

      case "VOICE_PRODUCED":
        this.handleProduced(event);
        break;

      case "VOICE_EXISTING_PRODUCERS":
        this.handleExistingProducers();
        break;

      case "VOICE_NEW_PRODUCER":
        this.handleNewProducer();
        break;

      case "VOICE_CONSUMER_CREATED":
        this.handleConsumerCreated(event);
        break;

      case "VOICE_USER_LEFT":
        consumerManager.removeConsumer(event.payload.userId);
    }
  }

  // ----------------------------
  // FLOW HANDLERS
  // ----------------------------

  private requestRtpCapabilities() {
    this.socket.send(
      JSON.stringify({
        type: "VOICE_GET_RTP_CAPABILITIES",
      }),
    );
  }

  private async handleRouterCapabilities(msg: any) {
    await deviceManager.loadDevice(msg.payload.rtpCapabilities);

    // create send transport
    this.socket.send(
      JSON.stringify({
        type: "VOICE_CREATE_TRANSPORT",
        payload: { direction: "send" },
      }),
    );
  }

  private handleTransportCreated(msg: any) {
    const device = deviceManager.getDevice();
    const { direction } = msg;

    if (direction === "send") {
      transportManager.createSendTransport(
        device,
        msg.payload,
        this.onConnect,
        this.onProduce,
      );

      // start mic → triggers connect + produce
      producerManager.startMic(transportManager.getSendTransport());
    } else {
      transportManager.createRecvTransport(device, msg.payload, this.onConnect);

      // Edge case handling (if recv transport was not created before consuming then consume now)
      if (this.shouldConsume) {
        this.requestConsumeAll();
        this.shouldConsume = false;
      }
    }
  }

  private handleTransportConnected(msg: any) {
    const direction: TransportDirection = msg.payload.direction;

    const callback = this.pendingConnectCallbacks[direction];

    if (callback) {
      callback();
      delete this.pendingConnectCallbacks[direction];
    }
  }

  private handleProduced(msg: any) {
    if (this.pendingProduceCallback) {
      this.pendingProduceCallback({
        id: msg.payload.producerId,
      });

      this.pendingProduceCallback = null;

      // now create recv transport
      this.socket.send(
        JSON.stringify({
          type: "VOICE_CREATE_TRANSPORT",
          payload: { direction: "recv" },
        }),
      );
    }
  }

  private handleExistingProducers() {
    //  If recv transport not ready → mark intent
    if (!transportManager.hasRecvTransport()) {
      this.shouldConsume = true;
      return;
    }

    this.requestConsumeAll();
  }

  private handleNewProducer() {
    // same logic as existing
    if (!transportManager.hasRecvTransport()) {
      this.shouldConsume = true;
      return;
    }

    this.requestConsumeAll();
  }

  private async handleConsumerCreated(msg: any) {
    const transport = transportManager.getRecvTransport();

    await consumerManager.consume(transport, msg.payload);

    // tell server to resume
    this.socket.send(
      JSON.stringify({
        type: "VOICE_RESUME_CONSUMER",
      }),
    );
  }

  // ----------------------------
  // CALLBACK HANDLERS
  // ----------------------------

  private onConnect = (
    dtlsParameters: any,
    direction: TransportDirection,
    callback: Function,
  ) => {
    this.pendingConnectCallbacks[direction] = callback;

    this.socket.send(
      JSON.stringify({
        type: "VOICE_CONNECT_TRANSPORT",
        payload: { dtlsParameters, direction },
      }),
    );
  };

  private onProduce = (
    kind: string,
    rtpParameters: any,
    callback: Function,
  ) => {
    this.pendingProduceCallback = callback;

    this.socket.send(
      JSON.stringify({
        type: "VOICE_PRODUCE",
        payload: { kind, rtpParameters },
      }),
    );
  };

  // ----------------------------
  // HELPERS
  // ----------------------------

  private requestConsumeAll() {
    this.socket.send(
      JSON.stringify({
        type: "VOICE_CONSUME",
        payload: {
          rtpCapabilities: deviceManager.getDevice().rtpCapabilities,
        },
      }),
    );
  }
}
