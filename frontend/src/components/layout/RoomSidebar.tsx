export default function RoomSidebar() {
  const rooms = [
    { id: "1", name: "Dev Room" },
    { id: "2", name: "Gaming Room" }
  ]

  return (
    <div className="w-20 bg-gray-800 flex flex-col items-center py-4 space-y-4">
      {rooms.map(room => (
        <div
          key={room.id}
          className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-600"
        >
          {room.name[0]}
        </div>
      ))}
    </div>
  )
}