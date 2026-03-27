import {api} from "@/core/api/axios"

export const getRooms = async () => {
  const res = await api.get("/rooms")
  return res.data.rooms
}

export const createRoom = async (name: string) => {
  const res = await api.post("/rooms/create", {name})
  return res.data
}

export const joinRoomApi = async (roomId: string) => {
  const res = await api.post("/rooms/join", { roomId })
  return res.data
}

export const leaveRoomApi = async (roomId: string) => {
  const res = await api.post("/rooms/leave", { roomId })
  return res.data
}