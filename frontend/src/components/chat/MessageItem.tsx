import type { Message } from "@/features/chat/types"

export default function MessageItem({ message }: { message: Message }) {
  return (
    <div className="mb-3">
      <div className="text-sm text-gray-400">
        {message.user.username}
      </div>
      <div className="text-white">
        {message.content}
      </div>
    </div>
  )
}