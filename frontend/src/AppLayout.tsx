import { useEffect } from "react"
import { useAuth } from "@/features/auth/AuthProvider"
import { ws } from "@/core/socket/WebSocketClient"
import Navbar from "./components/Navbar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()

  useEffect(() => {
    if (!token) return

    ws.connect(`ws://localhost:8000?token=${token}`)

    return () => {
      ws.disconnect()
    }
  }, [token])

  return (
    <div className="h-screen flex flex-col">
      {/* NAVBAR HERE */}
      <Navbar />

      {/* MAIN CONTENT */}
      <div className="flex-1 bg-gray-900">
        {children}
      </div>
    </div>
  )
}