import { WebSocket } from "ws"

export interface AuthedSocket extends WebSocket {  // Extend WebSocket to include user information
  userId: string
}

export interface RawClientEvent {  // Base interface for all client events, with a type field to discriminate between event types
  type: string
  [key: string]: any
}

export interface SendMessageEvent {  // Client event for sending a chat message to a room
  type: "SEND_MESSAGE"
  roomId: string
  content: string
}

export interface VoiceJoinEvent {
  type: "VOICE_JOIN"
  payload: {
    voiceChannelId: string
  }
}

export interface VoiceLeaveEvent {
  type: "VOICE_LEAVE"
}

export interface CreateTransportEvent {
  type: "VOICE_CREATE_TRANSPORT"
}

export interface ConnectTransportEvent {
  type: "VOICE_CONNECT_TRANSPORT"
  payload: {
    transportId: string
    dtlsParameters: unknown
  }
}

export interface ProduceEvent {
  type: "VOICE_PRODUCE"
  payload: {
    transportId: string
    kind: "audio" | "video"
    rtpParameters: unknown
  }
}

export interface ConsumeEvent {
  type: "VOICE_CONSUME"
  payload: {
    producerId: string
  }
}

// Union type for all possible client events, allowing for type-safe handling of incoming messages based on their type field
export type ClientEvent =  
  | SendMessageEvent
  | VoiceJoinEvent
  | VoiceLeaveEvent
  | CreateTransportEvent
  | ConnectTransportEvent
  | ProduceEvent
  | ConsumeEvent

export interface RoomSubscribedEvent {
  type: "ROOM_SUBSCRIBED"
  roomIds: string[]
}

export interface NewMessageEvent {
  type: "NEW_MESSAGE"
  roomId: string
  message: {
    id: string
    content: string
    userId: string
    createdAt: Date
    user:{
      id: string,
      username: string
    }
  }
}

export interface ErrorEvent { // Server event for sending error messages back to the client
  type: "ERROR"
  message: string
}

// remove after mediasoup
export interface VoiceSignalEvent {  // Server event for relaying WebRTC signals (offer, answer, ICE candidates) to clients in a room
  type: "VOICE_SIGNAL"  
  roomId: string
  payload: unknown
}

export interface VoiceParticipantsEvent {
  type: "VOICE_PARTICIPANTS"
  payload: {
    voiceChannelId: string
    users: {
      userId: string
    }[]
  }
}

export interface VoiceUserJoinedEvent {
  type: "VOICE_USER_JOINED"
  payload: {
    voiceChannelId: string
    userId: string
  }
}

export interface VoiceUserLeftEvent {
  type: "VOICE_USER_LEFT"
  payload: {
    voiceChannelId: string
    userId: string
  }
}

export type ServerEvent =
  | RoomSubscribedEvent
  | NewMessageEvent
  | ErrorEvent
  | VoiceParticipantsEvent
  | VoiceUserJoinedEvent
  | VoiceUserLeftEvent
  | VoiceSignalEvent   // remove after mediasoup