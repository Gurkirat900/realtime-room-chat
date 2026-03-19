import * as mediasoupClient from "mediasoup-client"

class ConsumerManager {
  private consumers = new Map<string, mediasoupClient.types.Consumer>()
  private audioElements = new Map<string, HTMLAudioElement>()

  /**
   * Consume a producer
   */
  async consume(
    recvTransport: mediasoupClient.types.Transport,
    params: {
      id: string
      producerId: string
      kind: "audio" | "video"   // future purpose if i want to implement video as well
      rtpParameters: any
    }
  ) {
    const { producerId } = params

    // prevent duplicate consumers
    if (this.consumers.has(producerId)) {
      console.log("Consumer already exists for producer:", producerId)
      return this.consumers.get(producerId)
    }

    try {
      const consumer = await recvTransport.consume(params)

      this.consumers.set(producerId, consumer)

      // Create audio element
      const stream = new MediaStream()
      stream.addTrack(consumer.track)

      const audio = document.createElement("audio")
      audio.srcObject = stream
      audio.autoplay = true
      audio.muted = false

      // Try playing (handle autoplay restrictions)
      audio.play().catch((e) => {
        console.warn("Autoplay blocked:", e)
      })

      // store audio
      this.audioElements.set(producerId, audio)

      // optional: attach to DOM (temporary for now) later create ui for this
      document.body.appendChild(audio)

      console.log("Consumer created for producer:", producerId)

      return consumer
    } catch (error) {
      console.error("Error consuming:", error)
      throw error
    }
  }

  /**
   * Remove consumer
   */
  removeConsumer(producerId: string) {
    const consumer = this.consumers.get(producerId)
    if (consumer) {
      consumer.close()
      this.consumers.delete(producerId)
    }

    const audio = this.audioElements.get(producerId)
    if (audio) {
      audio.srcObject = null
      audio.remove()
      this.audioElements.delete(producerId)
    }

    console.log("Consumer removed:", producerId)
  }

  /**
   * Cleanup all consumers
   */
  cleanup() {
    this.consumers.forEach((consumer) => consumer.close())
    this.consumers.clear()

    this.audioElements.forEach((audio) => {
      audio.srcObject = null
      audio.remove()
    })
    this.audioElements.clear()

    console.log("All consumers cleaned up")
  }

  /**
   * Check if already consuming
   */
  hasConsumer(producerId: string) {
    return this.consumers.has(producerId)
  }
}

export const consumerManager = new ConsumerManager()