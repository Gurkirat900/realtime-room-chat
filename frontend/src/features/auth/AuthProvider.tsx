import { ws } from "@/core/socket/WebSocketClient";
import { createContext, useContext, useState } from "react";

type User = {
  id: string
  username: string
  email: string
  createdAt?: string
}
type AuthContextType = {
  token: string | null;
  user: User | null;
  loginUser: (token: string, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );

  const [user, setUser] = useState<User | null>(
    JSON.parse(localStorage.getItem("user") || "null"),
  );

  const loginUser = (token: string, user:User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user))

    setToken(token);
    setUser(user)
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.setItem("user", JSON.stringify(user))

    setToken(null);
    setUser(null)
    ws.disconnect();
  };

  return (
    <AuthContext.Provider value={{ token,user, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  // acesss {token,loginUser,logout} anywhere in app
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
