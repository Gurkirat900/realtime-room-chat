import { deviceManager } from "@/core/mediasoup/deviceManager";
import { transportManager } from "@/core/mediasoup/transportManager";
import { producerManager } from "@/core/mediasoup/producerManager";
import { consumerManager } from "@/core/mediasoup/consumerManager";
import { WebSocketClient } from "@/core/socket/WebSocketClient";

type TransportDirection = "send" | "recv";

export class VoiceClient {
  private ws: WebSocketClient;


  private pendingConnectCallbacks: Partial<
    // {send? -> func | recv? -> func} Partial makes it optional to have a direction
    Record<TransportDirection, Function>
  > = {};

  private pendingProduceCallback: Function | null = null;

  private shouldConsume = false; // used when new user tries to consume a producer but device hasnt loaded yet

  private listeners: Record<string, Function[]> = {}; // Ui event system

  
  constructor(ws: WebSocketClient) {
    this.ws = ws;

    // Register WS event listeners
    this.ws.on("VOICE_PARTICIPANTS", this.handleParticipants);
    this.ws.on(
      "VOICE_ROUTER_RTP_CAPABILITIES",
      this.handleRouterCapabilities,
    );
    this.ws.on("VOICE_TRANSPORT_CREATED", this.handleTransportCreated);
    this.ws.on(
      "VOICE_TRANSPORT_CONNECTED",
      this.handleTransportConnected,
    );
    this.ws.on("VOICE_PRODUCED", this.handleProduced);
    this.ws.on("VOICE_EXISTING_PRODUCERS", this.handleExistingProducers);
    this.ws.on("VOICE_NEW_PRODUCER", this.handleNewProducer);
    this.ws.on("VOICE_CONSUMER_CREATED", this.handleConsumerCreated);
    this.ws.on("VOICE_USER_LEFT", this.handleUserLeft);
  }

  // Public Apis=>
  joinChannel(voiceChannelId: string) {
    this.ws.send("VOICE_JOIN", { voiceChannelId });
  }

 leaveChannel() {
    this.ws.send("VOICE_LEAVE");
  }

  cleanup() {
    producerManager.stopMic();
    consumerManager.cleanup();
    transportManager.reset();

    // remove WS listeners
    this.ws.off("VOICE_PARTICIPANTS", this.handleParticipants);
    this.ws.off(
      "VOICE_ROUTER_RTP_CAPABILITIES",
      this.handleRouterCapabilities,
    );
    this.ws.off("VOICE_TRANSPORT_CREATED", this.handleTransportCreated);
    this.ws.off(
      "VOICE_TRANSPORT_CONNECTED",
      this.handleTransportConnected,
    );
    this.ws.off("VOICE_PRODUCED", this.handleProduced);
    this.ws.off(
      "VOICE_EXISTING_PRODUCERS",
      this.handleExistingProducers,
    );
    this.ws.off("VOICE_NEW_PRODUCER", this.handleNewProducer);
    this.ws.off(
      "VOICE_CONSUMER_CREATED",
      this.handleConsumerCreated,
    );
    this.ws.off("VOICE_USER_LEFT", this.handleUserLeft);

    // clear UI listeners
    this.listeners = {};
  }


  on(event: string, cb: Function) {
    // used by useVoice.ts
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(cb);
  }

  off(event: string, cb: Function) {
    this.listeners[event] = this.listeners[event]?.filter((f) => f !== cb);
  }

  private emit(event: string, data?: any) {
    // EVENT emitter=> for UI
    this.listeners[event]?.forEach((cb) => cb(data));  // execute every fn
  }

  

  // ----------------------------
  // WS HANDLERS
  // ----------------------------

  private handleParticipants = (payload: any) => {
    this.emit("participants", payload.users);   // userIds of existing participants emitted to react in useVoice.ts
    this.requestRtpCapabilities();
  };

  private requestRtpCapabilities() {
    this.ws.send("VOICE_GET_RTP_CAPABILITIES");
  }

  private handleRouterCapabilities= async (payload: any) =>{
    await deviceManager.loadDevice(payload.rtpCapabilities);

    // create send transport
    this.ws.send("VOICE_CREATE_TRANSPORT", { direction: "send" });
  }

  private handleTransportCreated= (payload: any)=> {
    const device = deviceManager.getDevice();
    const { direction, ...params } = payload;

    if (direction === "send") {
      transportManager.createSendTransport(
        device,
        params,
        this.onConnect,
        this.onProduce,
      );

      // start mic → triggers connect + produce
      producerManager.startMic(transportManager.getSendTransport());
    } else {
      transportManager.createRecvTransport(device, params, this.onConnect);

      // Edge case handling (if recv transport was not created before consuming then consume now)
      if (this.shouldConsume) {
        this.requestConsumeAll();
        this.shouldConsume = false;
      }
    }
  }

  private handleTransportConnected= (payload: any)=> {
    const direction: TransportDirection = payload.direction;

    const callback = this.pendingConnectCallbacks[direction];

    if (callback) {
      callback();
      delete this.pendingConnectCallbacks[direction];
    }
  }

  private handleProduced= (payload: any) =>{
    if (this.pendingProduceCallback) {
      this.pendingProduceCallback({
        id: payload.producerId,
      });

      this.pendingProduceCallback = null;

      // now create recv transport
      this.ws.send("VOICE_CREATE_TRANSPORT", {
        direction: "recv",
      });
    }
  }

  private handleExistingProducers= ()=> {
    //  If recv transport not ready → mark intent
    if (!transportManager.hasRecvTransport()) {
      this.shouldConsume = true;
      return;
    }

    this.requestConsumeAll();
  }

  private handleNewProducer= ()=> {
    // same logic as existing
    if (!transportManager.hasRecvTransport()) {
      this.shouldConsume = true;
      return;
    }

    this.requestConsumeAll();
  }

  private handleConsumerCreated= async (payload: any) =>{
    const transport = transportManager.getRecvTransport();

    await consumerManager.consume(transport,payload);

    // tell server to resume
    this.ws.send("VOICE_RESUME_CONSUMER", {
      consumerId: payload.id,
    });
  }

  private handleUserLeft = (payload: any) => {
    consumerManager.removeConsumer(payload.userId);
    this.emit("UserLeft", payload.userId);
  };

  // ----------------------------
  // MEDIASOUP CALLBACK HANDLERS
  // ----------------------------

  private onConnect = (
    dtlsParameters: any,
    direction: TransportDirection,
    callback: Function,
  ) => {
    this.pendingConnectCallbacks[direction] = callback;

    this.ws.send("VOICE_CONNECT_TRANSPORT", {
      dtlsParameters,
      direction,
    });
  };

  private onProduce = (
    kind: string,
    rtpParameters: any,
    callback: Function,
  ) => {
    this.pendingProduceCallback = callback;

    this.ws.send("VOICE_PRODUCE", {
      kind,
      rtpParameters,
    });
  };

  // ----------------------------
  // HELPERS
  // ----------------------------

  private requestConsumeAll() {
    this.ws.send("VOICE_CONSUME", {
      rtpCapabilities:
        deviceManager.getDevice().recvRtpCapabilities,
    });
  }
  
}
