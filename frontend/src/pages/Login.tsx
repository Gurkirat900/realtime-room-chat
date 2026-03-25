import { useState } from "react"
import { login } from "@/features/auth/api"
import { useAuth } from "@/features/auth/AuthProvider"
import { useNavigate, Link } from "react-router-dom"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const { loginUser } = useAuth()   
  const navigate = useNavigate()

  const handleLogin = async () => {
    const data = await login({ email, password })

    loginUser(data.token)  // set token to loacal storage
    navigate("/")
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-6 rounded-xl w-80">
        <h2 className="text-white text-xl mb-4">Login</h2>

        <input
          className="w-full mb-3 p-2 rounded bg-gray-700 text-white"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full mb-3 p-2 rounded bg-gray-700 text-white"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 p-2 rounded text-white"
        >
          Login
        </button>

        <p className="text-gray-400 mt-3 text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-400">
            Signup
          </Link>
        </p>
      </div>
    </div>
  )
}