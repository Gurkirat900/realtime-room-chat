import { useRef } from "react";
import * as mediasoupClient from "mediasoup-client";

export default function VoiceChannel() {
  const socketRef = useRef(null);
  const deviceRef = useRef(null);
  const sendTransportRef = useRef(null);
  const recvTransportRef = useRef(null);

  const pendingProduceCallback = useRef(null);
  const pendingTransportsRef = useRef([]); // queue to handle async events so device is loaded before calling create transport event
  const tokenA =
    "anything";
  const tokenB =
    "anything";

  const connect = () => {
    const token = window.location.hash === "#user2" ? tokenB : tokenA;

    socketRef.current = new WebSocket(`ws://localhost:8000?token=${token}`);
    socketRef.current.onopen = () => {
      console.log("WS connected");
    };

    socketRef.current.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      console.log("WS:", msg);

      // -----------------------------
      // VOICE PARTICIPANTS
      // -----------------------------
      if (msg.type === "VOICE_PARTICIPANTS") {
        socketRef.current.send(
          JSON.stringify({
            type: "VOICE_GET_RTP_CAPABILITIES",
          }),
        );
      }

      // -----------------------------
      // ROUTER CAPABILITIES
      // -----------------------------

      const handleTransport = (msg) => {
        const params = msg.payload;
        const direction = msg.direction;

        if (direction === "send") {
          sendTransportRef.current =
            deviceRef.current.createSendTransport(params);

          sendTransportRef.current.on(
            "connect",
            ({ dtlsParameters }, callback) => {
              socketRef.current.send(
                JSON.stringify({
                  type: "VOICE_CONNECT_TRANSPORT",
                  payload: {
                    direction: "send",
                    dtlsParameters,
                  },
                }),
              );

              callback();
            },
          );

          sendTransportRef.current.on(
            "produce",
            ({ kind, rtpParameters }, callback) => {
              pendingProduceCallback.current = callback;

              socketRef.current.send(
                JSON.stringify({
                  type: "VOICE_PRODUCE",
                  payload: {
                    kind,
                    rtpParameters,
                  },
                }),
              );
            },
          );

          console.log(
            "can produce audio:",
            deviceRef.current.canProduce("audio"),
          );

          startMic();
        }

        if (direction === "recv") {
          recvTransportRef.current =
            deviceRef.current.createRecvTransport(params);

          recvTransportRef.current.on(
            "connect",
            ({ dtlsParameters }, callback) => {
              socketRef.current.send(
                JSON.stringify({
                  type: "VOICE_CONNECT_TRANSPORT",
                  payload: {
                    direction: "recv",
                    dtlsParameters,
                  },
                }),
              );

              callback();
            },
          );

          socketRef.current.send(
            JSON.stringify({
              type: "VOICE_CONSUME",
              payload: {
                rtpCapabilities: deviceRef.current.rtpCapabilities,
              },
            }),
          );
        }
      };


      if (msg.type === "VOICE_ROUTER_RTP_CAPABILITIES") {
        deviceRef.current = new mediasoupClient.Device();

        await deviceRef.current.load({
          routerRtpCapabilities: msg.payload.rtpCapabilities,
        });

        console.log("Device loaded");
        // process queued transports
        for (const queuedMsg of pendingTransportsRef.current) {
          handleTransport(queuedMsg);
        }

        pendingTransportsRef.current = [];

        socketRef.current.send(
          JSON.stringify({
            type: "VOICE_CREATE_TRANSPORT",
            payload: { direction: "send" },
          }),
        );
      }

      // -----------------------------
      // TRANSPORT CREATED
      // -----------------------------
      if (msg.type === "VOICE_TRANSPORT_CREATED") {
        if (!deviceRef.current || !deviceRef.current.loaded) {
          console.log("Device not loaded yet, queueing transport");
          pendingTransportsRef.current.push(msg);
          return;
        }

        handleTransport(msg);
      }
      
      if (msg.type === "VOICE_EXISTING_PRODUCERS") {
        const producers = msg.payload.producerIds;

        for (const producerId of producers) {
          socketRef.current.send(
            JSON.stringify({
              type: "VOICE_CREATE_TRANSPORT",
              payload: { direction: "recv" },
            }),
          );
        }
      }

      // -----------------------------
      // PRODUCER CONFIRMED
      // -----------------------------
      if (msg.type === "VOICE_PRODUCED") {
        if (pendingProduceCallback.current) {
          pendingProduceCallback.current({
            id: msg.payload.producerId,
          });

          pendingProduceCallback.current = null;
        }
      }

      // -----------------------------
      // NEW PRODUCER
      // -----------------------------
      if (msg.type === "VOICE_NEW_PRODUCER") {
        socketRef.current.send(
          JSON.stringify({
            type: "VOICE_CREATE_TRANSPORT",
            payload: { direction: "recv" },
          }),
        );
      }

      // -----------------------------
      // CONSUMER CREATED
      // -----------------------------
      if (msg.type === "VOICE_CONSUMER_CREATED") {
        console.log("consumer:", msg.payload);
        const { id, producerId, kind, rtpParameters } = msg.payload;

        const consumer = await recvTransportRef.current.consume({
          id,
          producerId,
          kind,
          rtpParameters,
        });
        console.log("track:", consumer.track);

        const stream = new MediaStream();
        stream.addTrack(consumer.track);

        const audio = document.createElement("audio");
        audio.srcObject = stream;
        audio.autoplay = true;
        audio.controls = true;
        audio.muted = false;

        document.body.appendChild(audio);
        console.log(audio);
        audio.play().catch(e => console.error("Autoplay blocked:", e));

        socketRef.current.send(
          JSON.stringify({
            type: "VOICE_RESUME_CONSUMER",
          }),
        );
      }
    };
  };

  const startMic = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const track = stream.getAudioTracks()[0];

    await sendTransportRef.current.produce({ track });

    console.log("Producing audio");
  };

  const joinVoice = () => {
    if (!socketRef.current) {
      connect();
    }

    const sendJoin = () => {
      socketRef.current.send(
        JSON.stringify({
          type: "VOICE_JOIN",
          payload: {
            voiceChannelId: "anything",
          },
        }),
      );
    };

    if (socketRef.current.readyState === WebSocket.OPEN) {
      sendJoin();
    } else {
      socketRef.current.onopen = sendJoin;
    }
  };

  const leaveVoice = () => {
    socketRef.current?.send(
      JSON.stringify({
        type: "VOICE_LEAVE",
      }),
    );
  };

  return (
    <div>
      {" "}
      <button onClick={joinVoice}>Join Voice</button>{" "}
      <button onClick={leaveVoice}>Leave Voice</button>{" "}
    </div>
  );
}
