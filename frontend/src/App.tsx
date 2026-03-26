import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "@/features/auth/AuthProvider"
import { Toaster } from "react-hot-toast"

import Login from "@/pages/Login"
import Signup from "@/pages/Signup"
import Home from "@/pages/Home"

import AppLayout from "@/components/layout/AppLayout"

function App() {
  const { token } = useAuth()

  return (
    <>
      <Toaster position="top-right" />

      <BrowserRouter>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* PROTECTED ROUTES */}
          <Route
            path="/"
            element={token ? <AppLayout /> : <Navigate to="/login" />}
          >
            <Route index element={<Home />} />

            {/* FUTURE */}
            {/* <Route path="room/:roomId" element={<Room />} /> */}
            {/* <Route path="room/:roomId/:channelId" element={<Channel />} /> */}
          </Route>

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App