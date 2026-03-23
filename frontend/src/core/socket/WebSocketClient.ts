type Listener = (data: any) => void

export class WebSocketClient {
  private socket: WebSocket | null = null
  private listeners: Record<string, Listener[]> = {}  // event_type-> handler(specific fn)

  connect(url: string) {
    this.socket = new WebSocket(url)

    this.socket.onopen = () => {
      console.log("WS Connected")
    }

    this.socket.onmessage = (event) => {  // handle server events
      const msg = JSON.parse(event.data)
      this.emit(msg.type, msg.payload)
    }

    this.socket.onclose = () => {
      console.log("WS Disconnected")
      // later: add reconnect logic
    }
  }

  send(type: string, payload?: any) {
    this.socket?.send(JSON.stringify({ type, payload }))
  }

  on(type: string, cb: Listener) {   // prevents race condition for onmessage fn
    if (!this.listeners[type]) this.listeners[type] = []
    this.listeners[type].push(cb)
  }

  off(type: string, cb: Listener) {
    this.listeners[type] = this.listeners[type]?.filter(f => f !== cb)
  }

  private emit(type: string, payload?: any) {
    this.listeners[type]?.forEach(cb => cb(payload))   // execute each fn(handlecreateTransport etc in VoiceClinet and messageClient)
  }
}

export const ws= new WebSocketClient()