import { useEffect } from "react"
import { Outlet } from "react-router-dom"
import { useAuth } from "@/features/auth/AuthProvider"
import { ws } from "@/core/socket/WebSocketClient"

import Navbar from "./Navbar"
import RoomSidebar from "./RoomSidebar"
import ChannelSidebar from "./ChannelSidebar"

export default function AppLayout() {
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
      {/* TOP NAVBAR */}
      <Navbar />

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* ROOMS */}
        <RoomSidebar />

        {/* CHANNELS */}
        <ChannelSidebar />

        {/* MAIN CONTENT */}
        <div className="flex-1 bg-gray-900 overflow-auto p-4">
          <Outlet />
        </div>
      </div>
    </div>
  )
}