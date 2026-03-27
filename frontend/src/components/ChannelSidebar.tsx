import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useRoomStore } from "@/features/rooms/store";
import { getVoiceChannels, createVoiceChannel } from "@/features/voice/api";
import type { VoiceChannel } from "@/features/voice/types";

export default function ChannelSidebar() {
  const { roomId } = useParams();
  const { rooms, leaveRoom } = useRoomStore();

  const [voiceChannels, setVoiceChannels] = useState<VoiceChannel[]>([]);
  const [newChannelName, setNewChannelName] = useState("");

  const room = rooms.find((r) => r.id === roomId);

  useEffect(() => {
    if (!room || !room.isJoined) return;

    const fetchChannels = async () => {
      try {
        const data = await getVoiceChannels(room.id);
        setVoiceChannels(data);
      } catch {
        console.error("Failed to fetch voice channels");
      }
    };

    fetchChannels();
  }, [room]);

  // NO ROOM
  if (!room) {
    return (
      <div className="w-64 bg-gray-850 p-4 text-gray-400">Select a room</div>
    );
  }

  // NOT JOINED
  if (!room.isJoined) {
    return (
      <div className="w-64 bg-gray-850 p-4 text-gray-400">
        Join room to see channels
      </div>
    );
  }

  const handleCreateVoice = async () => {
    if (!newChannelName.trim()) return;

    try {
      const newChannel = await createVoiceChannel(room.id, newChannelName);

      setVoiceChannels((prev) => [...prev, newChannel]);
      setNewChannelName("");
    } catch {
      console.error("Failed to create voice channel");
    }
  };

  return (
    <div className="w-64 bg-gray-850 p-4 text-gray-300 flex flex-col">
      {/* TEXT CHANNEL */}
      <h2 className="text-sm font-semibold mb-2">TEXT CHANNEL</h2>
      <div className="mb-4">
        <div className="hover:bg-gray-700 p-2 rounded cursor-pointer">
          # Main channel
        </div>
      </div>

      {/* VOICE CHANNELS */}
      <h2 className="text-sm font-semibold mb-2">VOICE CHANNELS</h2>
      <ul className="mb-4">
        {voiceChannels.map((vc) => (
          <li
            key={vc.id}
            className="hover:bg-gray-700 p-2 rounded cursor-pointer"
          >
            🔊 {vc.name}
          </li>
        ))}
      </ul>

      <div className="mb-4">
        <input
          value={newChannelName}
          onChange={(e) => setNewChannelName(e.target.value)}
          placeholder="New voice channel"
          className="w-full p-2 mb-2 rounded bg-gray-800"
        />

        <button
          onClick={handleCreateVoice}
          className="w-full bg-green-600 py-2 rounded hover:bg-green-500"
        >
          + Create Voice Channel
        </button>
      </div>

      {/* PUSH LEAVE BUTTON TO BOTTOM */}
      <div className="mt-auto">
        <button
          onClick={() => leaveRoom(room.id)}
          className="w-full bg-red-600 py-2 rounded hover:bg-red-500"
        >
          Leave Room
        </button>
      </div>
    </div>
  );
}
