import { useEffect, useRef } from "react"
import MessageItem from "./MessageItem"
import type { Message } from "@/features/chat/types"

export default function MessageList({ messages }: { messages: Message[] }) {
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.map(msg => (
        <MessageItem key={msg.id} message={msg} />
      ))}

      {/* auto scroll anchor */}
      <div ref={bottomRef} />
    </div>
  )
}