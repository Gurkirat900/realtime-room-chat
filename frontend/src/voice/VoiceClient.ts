import * as mediasoupClient from "mediasoup-client";

export class VoiceClient {
  device: mediasoupClient.Device | null = null;

  sendTransport: mediasoupClient.types.Transport | null = null;
  recvTransport: mediasoupClient.types.Transport | null = null;

  micProducer: mediasoupClient.types.Producer | null = null;

  consumers = new Map<string, mediasoupClient.types.Consumer>(); // producer_id->consumer

  audioElements = new Map<string, HTMLAudioElement>();

  pendingProducerIds: string[] = []; // used when new user tries to create producer but device hasnt loaded yet

  socket: WebSocket;

  constructor(socket: WebSocket) {
    this.socket = socket;
  }

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


//   handleSocketEvent(event: any) {

//   switch(event.type) {

//     case "VOICE_PARTICIPANTS":
//       this.requestRouterCapabilities()
//       break

//     case "VOICE_ROUTER_RTP_CAPABILITIES":
//       this.handleRouterCapabilities(event)
//       break

//     case "VOICE_TRANSPORT_CREATED":
//       this.handleTransportCreated(event)
//       break

//     case "VOICE_PRODUCED":
//       this.handleProducerConfirmed(event)
//       break

//     case "VOICE_EXISTING_PRODUCERS":
//       this.handleExistingProducers(event)
//       break

//     case "VOICE_NEW_PRODUCER":
//       this.handleNewProducer(event)
//       break

//     case "VOICE_CONSUMER_CREATED":
//       this.handleConsumerCreated(event)
//       break

//   }

// }
}
