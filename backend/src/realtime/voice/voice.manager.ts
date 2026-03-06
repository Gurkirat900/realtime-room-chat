import type { AuthedSocket } from "../types.js";

class VoiceManager {
  private channels = new Map<string, Set<AuthedSocket>>();
  private socketToChannel = new Map<AuthedSocket, string>();

  join(channelId: string, socket: AuthedSocket): string| null {
    const existingChannel = this.socketToChannel.get(socket);

    // if already in a channel, leave it first
    if (existingChannel) {
      this.leave(socket);
    }

    if (!this.channels.has(channelId)) {
      this.channels.set(channelId, new Set());
    }

    const sockets = this.channels.get(channelId)!;

    sockets.add(socket);
    this.socketToChannel.set(socket, channelId);

    return existingChannel ?? null;
  }

  leave(socket: AuthedSocket) {
    const channelId = this.socketToChannel.get(socket);
    if (!channelId) return;

    const sockets = this.channels.get(channelId);

    sockets?.delete(socket);

    if (sockets && sockets.size === 0) {
      this.channels.delete(channelId);
    }

    this.socketToChannel.delete(socket);
  }

  getParticipants(channelId: string) {
    return this.channels.get(channelId) ?? new Set();
  }

  getChannel(socket:AuthedSocket){
    return this.socketToChannel.get(socket)
  }

  removeSocket(socket: AuthedSocket) {
    this.leave(socket);
  }
}

export const voiceManager= new VoiceManager();
