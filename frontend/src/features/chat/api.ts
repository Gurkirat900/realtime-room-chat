import {api} from "@/core/api/axios"

export const getMessages = async (roomId: string) => {
  const res = await api.get(`/rooms/${roomId}/messages`)
  return res.data
}