import {api} from "@/core/api/axios"

export const getVoiceChannels = async (roomId: string) => {
  const res = await api.get(`/rooms/${roomId}/voice-channels`)
  return res.data
}

export const createVoiceChannel = async (roomId: string, name: string) => {
  const res = await api.post(`/rooms/${roomId}/voice-channels/create`, { name })
  return res.data
}