import { create } from "zustand";
import { getRooms, createRoom, joinRoomApi, leaveRoomApi } from "./api";
import type { Room } from "./types";

type RoomStore = {
  rooms: Room[];
  isLoading: boolean;
  selectedRoomId: string | null;

  fetchRooms: () => Promise<void>;
  addRoom: (name: string) => Promise<Room>;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: (roomId: string) => Promise<void>;

  setSelectedRoom: (roomId: string) => void;
};

export const useRoomStore = create<RoomStore>((set) => ({
  rooms: [],
  isLoading: false,
  selectedRoomId: null,

  fetchRooms: async () => {
    set({ isLoading: true });
    try {
      const rooms = await getRooms();
      set({ rooms });
    } catch (err) {
      console.error("Failed to fetch rooms");
    } finally {
      set({ isLoading: false });
    }
  },

  addRoom: async (name: string) => {
    try {
      const res = await createRoom(name);
      console.log(res);

      // OPTIONAL: if backend returns created room
      if (res) {
        console.log("inside res.room:", res);
        set((state) => ({
          rooms: [...state.rooms, res],
        }));
        return res;
      } else {
        // fallback → refetch
        const rooms = await getRooms();
        set({ rooms });
      }
    } catch (err) {
      console.error("Failed to create room");
      throw err;
    }
  },

  joinRoom: async (roomId: string) => {
    const state = useRoomStore.getState();
    const room = state.rooms.find((r) => r.id === roomId);

    //  prevent duplicate API call
    if (room?.isJoined) return;

    try {
      await joinRoomApi(roomId);

      set((state) => ({
        rooms: state.rooms.map((room) =>
          room.id === roomId ? { ...room, isJoined: true } : room,
        ),
      }));
    } catch (err) {
      console.error("Failed to join room");
      throw err;
    }
  },

  leaveRoom: async (roomId: string) => {
    try {
      await leaveRoomApi(roomId);

      set((state) => ({
        rooms: state.rooms.map((room) =>
          room.id === roomId ? { ...room, isJoined: false } : room,
        ),
      }));
    } catch (err) {
      console.error("Failed to leave room");
      throw err;
    }
  },

  setSelectedRoom: (roomId) => {
    set({ selectedRoomId: roomId });
  },
}));
