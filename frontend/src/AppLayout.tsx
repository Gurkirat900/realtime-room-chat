import { useEffect } from "react"
import { useAuth } from "@/features/auth/AuthProvider"
import { ws } from "@/core/socket/WebSocketClient"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()

  useEffect(() => {
    if (!token) return

    ws.connect(`ws://localhost:8000?token=${token}`)

    return () => {
      ws.disconnect()
    }
  }, [token])

  return <>{children}</>
}