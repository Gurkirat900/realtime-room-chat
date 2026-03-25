import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useEffect } from "react"
import { ws } from "@/core/socket/WebSocketClient"
import { useAuth } from "@/features/auth/AuthProvider"

import Login from "@/pages/Login"
import Signup from "@/pages/Signup"
import Home from "@/pages/Home"

function App() {
  const { token } = useAuth()

  useEffect(() => {
    if (!token) return

    ws.connect(`ws://localhost:8000?token=${token}`)
  }, [token])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected */}
        <Route
          path="/"
          element={
            token ? <Home /> : <Navigate to="/login" />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App