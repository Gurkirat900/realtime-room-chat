import { useState } from "react";
import { signup } from "@/features/auth/api";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      await signup({ username, email, password });

      navigate("/");
    } catch (error: any) {
      const message = error.response?.data?.error || "Signup failed";
      toast.error(message);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-6 rounded-xl w-80">
        <h2 className="text-white text-xl mb-4">Signup</h2>

        <input
          className="w-full mb-3 p-2 rounded bg-gray-700 text-white"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

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
          onClick={handleSignup}
          className="w-full bg-green-500 p-2 rounded text-white"
        >
          Signup
        </button>

        <p className="text-gray-400 mt-3 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
