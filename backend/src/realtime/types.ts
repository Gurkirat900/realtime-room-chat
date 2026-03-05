import { WebSocket } from "ws"

export interface AuthedSocket extends WebSocket {  // Extend WebSocket to include user information
  userId: string
}

export interface RawClientEvent {  // Base interface for all client events, with a type field to discriminate between event types
  type: string
  [key: string]: any
}

export interface SubscribeRoomsEvent {  // Client event for subscribing to multiple rooms
  type: "SUBSCRIBE_ROOMS"
  roomIds: string[]
}

export interface UnsubscribeRoomEvent {  // Client event for unsubscribing from a single room
  type: "UNSUBSCRIBE_ROOM"
  roomId: string
}

export interface SendMessageEvent {  // Client event for sending a chat message to a room
  type: "SEND_MESSAGE"
  roomId: string
  content: string
}

export interface VoiceOfferEvent {  // Client event for sending a WebRTC offer to a room for voice chat
  type: "VOICE_OFFER"
  roomId: string
  offer: unknown
}

export interface VoiceAnswerEvent {  // Client event for sending a WebRTC answer to a room for voice chat
  type: "VOICE_ANSWER"
  roomId: string
  answer: unknown
}

export interface IceCandidateEvent {  // Client event for sending a WebRTC ICE candidate to a room for voice chat
  type: "ICE_CANDIDATE"
  roomId: string
  candidate: unknown
}

// Union type for all possible client events, allowing for type-safe handling of incoming messages based on their type field
export type ClientEvent =  
  | SubscribeRoomsEvent
  | UnsubscribeRoomEvent
  | SendMessageEvent
  | VoiceOfferEvent
  | VoiceAnswerEvent
  | IceCandidateEvent

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

export interface VoiceSignalEvent {  // Server event for relaying WebRTC signals (offer, answer, ICE candidates) to clients in a room
  type: "VOICE_SIGNAL"  
  roomId: string
  payload: unknown
}

export type ServerEvent =
  | RoomSubscribedEvent
  | NewMessageEvent
  | ErrorEvent
  | VoiceSignalEvent