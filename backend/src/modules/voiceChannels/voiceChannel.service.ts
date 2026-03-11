import {prisma} from "../../lib/prisma.js"

export async function createVoiceChannel(roomId: string, name: string) {
  return prisma.voiceChannel.create({
    data: {
      name,
      roomId
    }
  })
}

export async function getVoiceChannels(roomId: string){
    return prisma.voiceChannel.findMany({
        where:{
            roomId: roomId
        }
    })
}