import * as mediasoupClient from "mediasoup-client"

type OnConnectCallback = (dtlsParameters: any, direction: "send" | "recv") => void
type OnProduceCallback = (kind: string, rtpParameters: any) => void

class TransportManager {
  private sendTransport: mediasoupClient.types.Transport | null = null
  private recvTransport: mediasoupClient.types.Transport | null = null

  /**
   * Create Send Transport
   */
  createSendTransport(
    device: mediasoupClient.Device,
    params: any,
    onConnect: OnConnectCallback,
    onProduce: OnProduceCallback
  ) {
    if (this.sendTransport) {
      console.log("Send transport already exists")
      return this.sendTransport
    }

    this.sendTransport = device.createSendTransport(params)

    // connect event
    this.sendTransport.on(
      "connect",
      ({ dtlsParameters }, callback) => {
        onConnect(dtlsParameters, "send")  // custom callback(tell voiceClient to send Connect transport event to server)
        callback()                        // mediasoup callback(tell mediasoup "done")
      }
    )

    // produce event
    this.sendTransport.on(     
      "produce",
      ({ kind, rtpParameters }, callback) => {
        onProduce(kind, rtpParameters)    // tell Voice Client to send VOICE_PRODUCE event
        // IMPORTANT: callback will be called later after server responds
      }
    )

    console.log("Send transport created")

    return this.sendTransport
  }

  /**
   * Create Recv Transport
   */
  createRecvTransport(
    device: mediasoupClient.Device,
    params: any,
    onConnect: OnConnectCallback
  ) {
    if (this.recvTransport) {
      console.log("Recv transport already exists")
      return this.recvTransport
    }

    this.recvTransport = device.createRecvTransport(params)

    this.recvTransport.on(
      "connect",
      ({ dtlsParameters }, callback) => {
        onConnect(dtlsParameters, "recv")
        callback()
      }
    )

    console.log("Recv transport created")

    return this.recvTransport
  }

  /**
   * Get Send Transport
   */
  getSendTransport() {
    if (!this.sendTransport) {
      throw new Error("Send transport not created")
    }
    return this.sendTransport
  }

  /**
   * Get Recv Transport
   */
  getRecvTransport() {
    if (!this.recvTransport) {
      throw new Error("Recv transport not created")
    }
    return this.recvTransport
  }

  /**
   * Check existence
   */
  hasSendTransport() {
    return !!this.sendTransport
  }

  hasRecvTransport() {
    return !!this.recvTransport
  }

  /**
   * Reset transports (used on leave)
   */
  reset() {
    this.sendTransport?.close()
    this.recvTransport?.close()

    this.sendTransport = null
    this.recvTransport = null
  }
}

export const transportManager = new TransportManager()