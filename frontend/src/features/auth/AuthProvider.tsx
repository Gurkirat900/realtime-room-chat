import { ws } from "@/core/socket/WebSocketClient"
import { createContext, useContext, useState } from "react"

type AuthContextType = {
  token: string | null
  loginUser: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  )

  const loginUser = (token: string) => {
    localStorage.setItem("token", token)
    setToken(token)
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    ws.disconnect()
  }

  return (
    <AuthContext.Provider value={{ token, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {    // acesss {token,loginUser,logout} anywhere in app
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}