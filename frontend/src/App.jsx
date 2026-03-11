import { useRef } from "react"
import * as mediasoupClient from "mediasoup-client"

export default function VoiceChannel() {

  const socketRef = useRef(null)
  const deviceRef = useRef(null)
  const sendTransportRef = useRef(null)

  const connect = () => {

    socketRef.current = new WebSocket("ws://localhost:8000?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MTcwYzYzOS04ODZhLTQxMDQtYWRlYi1hOTY2ZWIxZDg0NGEiLCJpYXQiOjE3NzMyNzIwNzEsImV4cCI6MTc3MzUzMTI3MX0.8i9Y8qrXrT7LvHMoMtWHOMzY5LyMvusPCFGzdlLibRI")

    socketRef.current.onopen = () => {
      console.log("WS connected")
    }

    socketRef.current.onmessage = async (event) => {

      const msg = JSON.parse(event.data)
      console.log("WS:", msg)

      // server confirms join
      if (msg.type === "VOICE_PARTICIPANTS") {

        socketRef.current.send(JSON.stringify({
          type: "VOICE_GET_RTP_CAPABILITIES",
          payload: {}
        }))

      }

      // load mediasoup device
      if (msg.type === "VOICE_ROUTER_RTP_CAPABILITIES") {

        deviceRef.current = new mediasoupClient.Device()

        await deviceRef.current.load({
          routerRtpCapabilities: msg.payload.rtpCapabilities
        })

        console.log("Device loaded")

        socketRef.current.send(JSON.stringify({
          type: "VOICE_CREATE_TRANSPORT",
          payload: { direction: "send" }
        }))
      }

      // transport created
      if (msg.type === "VOICE_TRANSPORT_CREATED") {

        const params = msg.payload

        sendTransportRef.current =
          deviceRef.current.createSendTransport(params)

        // connect transport
        sendTransportRef.current.on(
          "connect",
          ({ dtlsParameters }, callback) => {

            socketRef.current.send(JSON.stringify({
              type: "VOICE_CONNECT_TRANSPORT",
              payload: {
                direction: "send",
                dtlsParameters
              }
            }))

            callback()
          }
        )

        // produce audio
        sendTransportRef.current.on(
          "produce",
          ({ kind, rtpParameters }, callback) => {

            socketRef.current.send(JSON.stringify({
              type: "VOICE_PRODUCE",
              payload: {
                kind,
                rtpParameters
              }
            }))

            socketRef.current.onmessage = (event) => {
              const res = JSON.parse(event.data)

              if (res.type === "VOICE_PRODUCED") {
                callback({ id: res.payload.producerId })
              }
            }
          }
        )

        startMic()
      }

    }
  }

  const startMic = async () => {

    const stream =
      await navigator.mediaDevices.getUserMedia({ audio: true })

    const track = stream.getAudioTracks()[0]

    await sendTransportRef.current.produce({ track })

    console.log("Producing audio")
  }

  const joinVoice = () => {

    if (!socketRef.current) {
      connect()
    }

    const sendJoin = () => {

      socketRef.current.send(JSON.stringify({
        type: "VOICE_JOIN",
        payload: {
          voiceChannelId: "a6bdc7ed-5bd3-4989-997e-38b41a35911c"
        }
      }))

    }

    if (socketRef.current.readyState === WebSocket.OPEN) {
      sendJoin()
    } else {
      socketRef.current.onopen = sendJoin
    }

  }

  const leaveVoice = () => {
    socketRef.current?.send(JSON.stringify({
      type: "VOICE_LEAVE"
    }))
  }

  return (
    <div>
      <button onClick={joinVoice}>Join Voice</button>
      <button onClick={leaveVoice}>Leave Voice</button>
    </div>
  )
}