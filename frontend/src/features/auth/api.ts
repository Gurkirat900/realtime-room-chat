import { api } from "@/core/api/axios"

export async function login(data: {
  email: string
  password: string
}) {
  const res = await api.post("/auth/login", data)
  return res.data
}

export async function signup(data: {
  username:string
  email: string
  password: string
}) {
  const res = await api.post("/auth/signup", data)
  return res.data
}