import { useParams } from "react-router-dom"
import { useRoomStore } from "@/features/rooms/store"
import { useChat } from "@/features/chat/useChat"
import MessageList from "@/components/chat/MessageList"

export default function RoomPage() {
  const { roomId } = useParams()
  const { rooms, joinRoom } = useRoomStore()

  const room = rooms.find(r => r.id === roomId)

  const { messages, isLoading } = useChat(roomId,room?.isJoined)

  if (!room) {
    return <div className="text-white">Room not found</div>
  }

  //  NOT JOINED → SHOW BUTTON
  if (!room.isJoined) {
    return (
      <div className="text-white flex flex-col items-center justify-center h-full">
        <h2 className="text-xl mb-4">
          Join "{room.name}" to start chatting
        </h2>

        <button
          onClick={() => joinRoom(room.id)}
          className="bg-blue-600 px-5 py-2 rounded hover:bg-blue-500"
        >
          Join Room
        </button>
      </div>
    )
  }

  //  JOINED → SHOW CHAT
  return (
    <div className="flex flex-col h-full text-white">
      <h1 className="p-4 border-b border-gray-700">
        {room.name}
      </h1>

      {isLoading ? (
        <div className="p-4">Loading messages...</div>
      ) : (
        <MessageList messages={messages} />
      )}
    </div>
  )
}