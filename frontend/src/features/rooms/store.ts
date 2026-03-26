import { create } from "zustand"
import { getRooms, createRoom } from "./api"
import type { Room } from "./types"

type RoomStore = {
  rooms: Room[]
  isLoading: boolean

  fetchRooms: () => Promise<void>
  addRoom: (name: string) => Promise<void>
}

export const useRoomStore = create<RoomStore>((set) => ({
  rooms: [],
  isLoading: false,

  fetchRooms: async () => {
    set({ isLoading: true })
    try {
      const rooms = await getRooms()
      set({ rooms })
    } catch (err) {
      console.error("Failed to fetch rooms")
    } finally {
      set({ isLoading: false })
    }
  },

  addRoom: async (name: string) => {
    try {
      const res = await createRoom(name)

      // OPTIONAL: if backend returns created room
      if (res?.room) {
        set((state) => ({
          rooms: [...state.rooms, res.room]
        }))
      } else {
        // fallback → refetch
        const rooms = await getRooms()
        set({ rooms })
      }
    } catch (err) {
      console.error("Failed to create room")
      throw err
    }
  }
}))