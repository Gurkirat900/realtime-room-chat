import type { Message } from "@/features/chat/types";
import { useAuth } from "@/features/auth/AuthProvider";

export default function MessageItem({ message }: { message: Message }) {
  const { user } = useAuth();

  const isMe = message.userId === user?.id;

  return (
    <div className={`flex mb-3 ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs px-4 py-2 rounded-lg ${
          isMe ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-100"
        }`}
      >
        {/* Show username only for others */}
        {!isMe && (
          <div className="text-xs text-gray-400 mb-1">
            {message.user.username}
          </div>
        )}

        <div>{message.content}</div>
        <div className="text-[10px] text-gray-400 mt-1">
          {new Date(message.createdAt).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
