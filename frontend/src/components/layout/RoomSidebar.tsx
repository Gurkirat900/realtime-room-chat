import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useRoomStore } from "@/features/rooms/store"

export default function RoomSidebar() {
  const navigate = useNavigate()
  const { rooms, fetchRooms, selectedRoomId, setSelectedRoom } = useRoomStore()

  useEffect(() => {
    fetchRooms()
  }, [])

  return (
    <div className="w-20 bg-gray-800 flex flex-col items-center py-4 space-y-4">
      
      {rooms.map(room => (
        <div
          key={room.id}
          title={room.name}
          onClick={() => {
            setSelectedRoom(room.id)
            navigate(`/room/${room.id}`)
          }}
          className={`w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer
            ${selectedRoomId === room.id ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}
          `}
        >
          {room.name.slice(0, 2).toUpperCase()}
        </div>
      ))}

      {/* CREATE */}
      <div
        onClick={() => navigate("/create")}
        className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center cursor-pointer hover:bg-green-500 mt-auto"
      >
        +
      </div>
    </div>
  )
}