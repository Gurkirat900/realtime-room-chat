import { useEffect } from "react"
import { ws } from "@/core/socket/WebSocketClient"
import VoiceTest from "@/voice/VoiceTest"

function App() {
  useEffect(() => {
    ws.connect("ws://localhost:8000") 
  }, [])

  return (
    <div>
      <h1>Voice System Test</h1>
      <VoiceTest />
    </div>
  )
}

export default App