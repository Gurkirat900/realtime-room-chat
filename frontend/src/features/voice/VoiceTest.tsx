import { useVoice } from "./useVoice"

export default function VoiceTest() {
  const { participants, isConnected, joinChannel, leaveChannel } = useVoice()

  return (
    <div style={{ padding: "20px", border: "1px solid gray" }}>
      <h2>Voice Test Panel</h2>

      <button onClick={() => joinChannel("room1")}>
        Join Room
      </button>

      <button onClick={leaveChannel}>
        Leave
      </button>

      <div style={{ marginTop: "10px" }}>
        <strong>Status:</strong> {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
      </div>

      <div style={{ marginTop: "10px" }}>
        <strong>Participants:</strong>
        {participants.length === 0 && <div>No users</div>}

        {participants.map((p) => (
          <div key={p}>{p}</div>
        ))}
      </div>
    </div>
  )
}