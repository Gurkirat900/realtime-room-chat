import { useEffect, useState } from "react";
import { getMessages } from "./api";
import type { Message } from "./types";
import { ws } from "@/core/socket/WebSocketClient";

export const useChat = (roomId?: string, isJoined?: boolean) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!roomId || !isJoined) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const data = await getMessages(roomId);
        setMessages(data.messages.reverse());
      } catch (err) {
        console.error("Failed to fetch messages");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    //  DEFINE HANDLER
    const handler = (data: { roomId: string; message: Message }) => {
      if (data.roomId !== roomId) return;

      setMessages((prev) => [...prev, data.message]);
    };

    //  LISTEN TO EVENT TYPE (NOT "message")
    ws.on("NEW_MESSAGE", handler);

    return () => {
      ws.off("NEW_MESSAGE", handler);
    };
  }, [roomId, isJoined]); // fetch when user changes room or joins a room

  const sendMessage = (content: string) => {
    if (!roomId || !content.trim()) return;

    ws.send("SEND_MESSAGE", {
        roomId, 
        content ,
    });
  };

  return {
    messages,
    isLoading,
    sendMessage,
  };
};
