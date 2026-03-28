export type Message = {
  id: string
  content: string
  userId: string
  roomId: string
  createdAt: string

  user: {
    id: string
    username: string
  }
}