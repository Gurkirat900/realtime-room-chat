# Real-Time Chat & Voice Infrastructure

A backend implementation of a **Discord-style real-time communication system** supporting:

- Real-time text messaging
- Voice channels
- WebRTC audio streaming
- SFU-based media routing
- Room-based communication

The goal of this project is to explore **how platforms like Discord handle messaging and voice communication at scale**.

---

# Architecture Overview

This system is designed with **separate layers for HTTP APIs, realtime messaging, and media routing**.

- **HTTP Layer** → authentication, room management, persistence  
- **WebSocket Layer** → real-time messaging and signaling  
- **Voice Signaling Layer** → WebRTC negotiation  
- **SFU Media Layer (mediasoup)** → routes RTP packets between participants  

### System Architecture

![System Architecture](docs/architecture.png)

---

# Tech Stack

### Backend
- Node.js
- TypeScript
- Express

### Realtime Communication
- WebSocket (`ws`)
- WebRTC

### Media Routing
- mediasoup (SFU)

### Database
- PostgreSQL
- Prisma ORM

---

# Core System Components

## 1. HTTP API Layer

Handles:

- Authentication
- Room creation
- Room membership
- Message persistence
- Voice channel creation

Flow:

```
Client → HTTP API → Service Layer → Database
```

---

## 2. Realtime Gateway (WebSocket)

A persistent WebSocket connection enables real-time communication.

Responsibilities:

- socket authentication
- connection lifecycle management
- user ↔ socket mapping
- routing realtime events

Example flow:

```
Client → WebSocket → Event Router
```

---

## 3. Room-Based Messaging System

Users subscribe to rooms through WebSocket connections.

When a user sends a message:

```
Client
   ↓
SEND_MESSAGE event
   ↓
message.router.ts
   ↓
MessageService
   ↓
PostgreSQL
   ↓
RoomManager.broadcast()
   ↓
All sockets subscribed to the room
```

`RoomManager` maintains **socket ↔ room subscriptions**.

---

## 4. Voice Channels with WebRTC

Voice communication uses **WebRTC transports** coordinated via WebSocket signaling.

Each user establishes two transports:

```
SendTransport → sends microphone audio
RecvTransport → receives audio from other users
```

These transports connect to mediasoup on the server.

---

# SFU Architecture (Selective Forwarding Unit)

Instead of peer-to-peer mesh networking, this system uses an **SFU architecture**.

### Mesh model (does not scale)

```
User A → B, C, D
User B → A, C, D
User C → A, B, D
```

Connections grow exponentially.

### SFU model

```
Users → SFU Router → Users
```

Each user sends **one stream to the server**, and the SFU forwards it to the appropriate participants.

---

# Media Flow (RTP Packet Flow)

Voice data flows through the system as **RTP packets**.

```
Microphone (Client)
      ↓
Producer (Client)
      ↓
WebRTC Send Transport
      ↓
WebRtcTransport (Server)
      ↓
Producer (Server)
      ↓
Router
      ↓
Consumer (Server)
      ↓
WebRtcTransport
      ↓
Recv Transport (Client)
      ↓
Consumer (Client)
      ↓
Audio Element (Speaker)
```

The server **does not encode or decode media**.  
It only **routes RTP packets between producers and consumers**.

---

# Voice Signaling Events

Voice communication is coordinated via WebSocket events.

Examples:

```
VOICE_JOIN
VOICE_LEAVE
VOICE_GET_RTP_CAPABILITIES
VOICE_CREATE_TRANSPORT
VOICE_CONNECT_TRANSPORT
VOICE_PRODUCE
VOICE_CONSUME
VOICE_RESUME_CONSUMER
```

These events orchestrate the **entire WebRTC lifecycle**.

---

# Database Schema

The system includes the following entities:

```
User
Room
RoomMembership
Message
VoiceChannel
```

These enable:

- user authentication
- room membership tracking
- message persistence
- voice channel participation

---

# Running the Project

### 1. Install dependencies

```
cd backend
npm install
```

### 2. Setup environment variables

Create a `.env` file:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="your-secret"
```

### 3. Run Prisma migrations

```
npx prisma migrate dev
```

### 4. Generate Prisma client

```
npx prisma generate
```

### 5. Start the development server

```
npm run dev
```

The server will start with:

- HTTP API
- WebSocket server
- mediasoup worker
---

# Current Features

- User authentication
- Room creation and membership
- Real-time messaging
- Voice channel join/leave
- WebRTC audio streaming
- mediasoup SFU routing

---

# Future Improvements

Planned enhancements include:

- Redis Pub/Sub for horizontal scaling
- speaking indicators
- mute / deafen controls
- full React voice client
- Docker deployment
- distributed signaling

---

# Inspiration

Platforms using similar architectures include:

- Discord
- Google Meet
- Zoom
- Slack Huddles

---

# Author

**Gurkirat Singh**

---

# License

MIT License
