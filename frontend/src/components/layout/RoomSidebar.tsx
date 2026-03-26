import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getRooms } from "@/features/rooms/api"
import type { Room } from "@/features/rooms/types"

export default function RoomSidebar() {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState<Room[]>([])

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await getRooms()
        setRooms(data)
      } catch (err) {
        console.error("Failed to fetch rooms")
      }
    }

    fetchRooms()
  }, [])

  return (
    <div className="w-20 bg-gray-800 flex flex-col items-center py-4 space-y-4">
      
      {/* ROOMS */}
      {rooms.map(room => (
        <div
          key={room.id}
          title={room.name}
          onClick={() => navigate(`/room/${room.id}`)}
          className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-600"
        >
          {room.name.slice(0, 2).toUpperCase()}
        </div>
      ))}

      {/* CREATE BUTTON */}
      <div
        onClick={() => navigate("/create")}
        className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center cursor-pointer hover:bg-green-500 mt-auto"
      >
        +
      </div>
    </div>
  )
}