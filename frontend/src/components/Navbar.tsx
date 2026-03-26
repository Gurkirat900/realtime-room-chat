import { useAuth } from "@/features/auth/AuthProvider"
import { useNavigate } from "react-router-dom"

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-gray-800 border-b border-gray-700">
      
      {/* Left */}
      <div className="text-white font-semibold text-lg">
        Chat App
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <div className="text-gray-300 text-sm">
          {user?.username || user?.email}
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  )
}