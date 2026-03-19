import * as mediasoupClient from "mediasoup-client"

class ProducerManager {
  private micProducer: mediasoupClient.types.Producer | null = null
  private micStream: MediaStream | null = null

  /**
   * Start microphone and produce audio
   */
  async startMic(sendTransport: mediasoupClient.types.Transport) {
    if (this.micProducer) {
      console.log("Mic already producing")
      return this.micProducer
    }

    try {
      // get mic stream
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: true
      })

      const track = this.micStream.getAudioTracks()[0]

      if (!track) {
        throw new Error("No audio track found")
      }

      // produce
      this.micProducer = await sendTransport.produce({  // this triggers sendTransport.connect()
        track
      })

      console.log("Mic producer created")

      return this.micProducer
    } catch (error) {
      console.error("Error starting mic:", error)
      throw error
    }
  }

  /**
   * Stop microphone
   */
  stopMic() {
    if (this.micProducer) {
      this.micProducer.close()
      this.micProducer = null
    }

    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop())
      this.micStream = null
    }

    console.log("Mic stopped")
  }

  /**
   * Check if mic is active
   */
  isMicActive() {
    return !!this.micProducer
  }

  /**
   * Get current producer
   */
  getProducer() {
    return this.micProducer
  }
}

export const producerManager = new ProducerManager()