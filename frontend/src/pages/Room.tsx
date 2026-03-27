import { useParams } from "react-router-dom"
import { useRoomStore } from "@/features/rooms/store"

export default function RoomPage() {
  const { roomId } = useParams()
  const { rooms, joinRoom } = useRoomStore()

  const room = rooms.find(r => r.id === roomId)

  if (!room) {
    return <div className="text-white">Room not found</div>
  }

  // ❌ NOT JOINED
  if (!room.isJoined) {
    return (
      <div className="text-white flex flex-col items-center justify-center h-full">
        <h2 className="text-xl mb-4">
          Join "{room.name}" to start chatting
        </h2>

        <button
          onClick={() => joinRoom(room.id)}
          className="bg-blue-600 px-5 py-2 rounded hover:bg-blue-500 transition"
        >
          Join Room
        </button>
      </div>
    )
  }

  // ✅ JOINED
  return (
    <div className="text-white">
      <h1 className="text-2xl font-bold">{room.name}</h1>
      <p className="mt-2 text-gray-400">
        Messages will appear here 👇
      </p>
    </div>
  )
}