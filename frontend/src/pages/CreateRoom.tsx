import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useRoomStore } from "@/features/rooms/store";

export default function CreateRoom() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const { addRoom } = useRoomStore();

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Room name required");
      return;
    }

    try {
      const room = await addRoom(name);
      toast.success("Room created");

      if (room?.id) {
        navigate(`/room/${room.id}`);
      } else {
        navigate("/");
      }

    } catch {
      toast.error("Failed to create room");
    }
  };

  return (
    <div className="text-white max-w-md">
      <h1 className="text-2xl font-bold mb-4">Create Room</h1>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Room name"
        className="w-full p-2 rounded bg-gray-800 mb-4"
      />

      <button
        onClick={handleCreate}
        className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500"
      >
        Create
      </button>
    </div>
  );
}
