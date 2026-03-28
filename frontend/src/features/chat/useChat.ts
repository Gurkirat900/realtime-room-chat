import { useEffect, useState } from "react"
import { getMessages } from "./api"
import type { Message } from "./types"

export const useChat = (roomId?: string, isJoined?:boolean) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!roomId || !isJoined) return

    const fetchMessages = async () => {
      setIsLoading(true)
      try {
        const data = await getMessages(roomId)
        setMessages(data.messages)
      } catch (err) {
        console.error("Failed to fetch messages")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()
  }, [roomId,isJoined])

  return {
    messages,
    isLoading
  }
}