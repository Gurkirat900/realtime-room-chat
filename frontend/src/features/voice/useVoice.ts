import { useEffect, useRef, useState } from "react"
import { VoiceClient } from "@/features/voice/VoiceClient"
import { ws } from "@/core/socket/WebSocketClient"

export function useVoice() {
  const vcRef = useRef<VoiceClient | null>(null)

  const [participants, setParticipants] = useState<string[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const vc = new VoiceClient(ws)
    vcRef.current = vc

    //  HANDLERS (stable references)
    const handleParticipants = (users: string[]) => {
      setParticipants(users)
      setIsConnected(true)
    }

    const handleUserLeft = (userId: string) => {
      setParticipants(prev => prev.filter(id => id !== userId))
    }

    //  SUBSCRIBE
    vc.on("participants", handleParticipants)
    vc.on("UserLeft", handleUserLeft)

    return () => {
      //  UNSUBSCRIBE 
      vc.off("participants", handleParticipants)
      vc.off("userLeft", handleUserLeft)

      //  CLEANUP
      vc.leaveChannel()
      vc.cleanup() 
    }
  }, []) 

  const joinChannel = (id: string) => {
    vcRef.current?.joinChannel(id)
  }

  const leaveChannel = () => {
    vcRef.current?.leaveChannel()
    setIsConnected(false)
    setParticipants([])
  }

  return {
    participants,
    isConnected,
    joinChannel,
    leaveChannel,
  }
}