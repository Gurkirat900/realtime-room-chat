export type Message = {
  id: string
  content: string
  userId: string
  roomId: string
  createdAt: string  // from backend comes as string in json format

  user: {
    id: string
    username: string
  }
}