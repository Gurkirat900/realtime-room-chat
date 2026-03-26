export type Room = {
  id: string
  name: string
  createdAt: string
  _count: {
    memberships: number
  }
}