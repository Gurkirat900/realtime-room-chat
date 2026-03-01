import { WebSocket } from "ws";

export interface User {
  socket: WebSocket;
  room: string;
}

export interface JoinMessage {
  type: "join";
  payload: {
    roomId: string;
  };
}

export interface ChatMessage {
  type: "chat";
  payload: {
    roomId: string;
    message: string;
  };
}

export type IncomingMessage = JoinMessage | ChatMessage;