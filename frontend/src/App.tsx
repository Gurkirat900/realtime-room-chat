import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "@/features/auth/AuthProvider"
import { Toaster } from "react-hot-toast"

import Login from "@/pages/Login"
import Signup from "@/pages/Signup"
import Home from "@/pages/Home"
import AppLayout from "./AppLayout"

function App() {
  const { token } = useAuth()

  return (
    <>
    <Toaster position="top-right" />
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected */}
        <Route
          path="/"
          element={
            token ? (
              <AppLayout>
                <Home />
              </AppLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
    </>
    
  )
}

export default App