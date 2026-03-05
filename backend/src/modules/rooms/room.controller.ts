import type { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import {
  createRoom,
  joinRoom,
  leaveRoom,
  getAllRooms,
} from "./room.service.js";
import { roomManager } from "../../realtime/room.manager.js";
import { socketRegistry } from "../../realtime/socket.registry.js";

export async function handleCreateRoom(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId; // Use non-null assertion since authenticate middleware guarantees user is set
    const { name } = req.body;

    const room = await createRoom(userId, name);

    res.status(201).json(room);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function handleJoinRoom(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.user.userId;
    const { roomId } = req.body;

    if (!roomId) {
      return res.status(400).json({ error: "roomId is required" });
    }

    const membership = await joinRoom(userId, roomId);

    // subscribe active sockets
    const sockets = socketRegistry.getUsersSockets(userId);

    for (const socket of sockets) {
      roomManager.subscribe(socket,[roomId]);
    }

    res.status(200).json({
      message: "Joined room successfully",
      membership,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function handleLeaveRoom(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.user.userId;
    const { roomId } = req.body;

    if (!roomId) {
      return res.status(400).json({ error: "roomId is required" });
    }

    await leaveRoom(userId, roomId);

    // unsubscribe from active rooms
    const sockets = socketRegistry.getUsersSockets(userId);
    for (const socket of sockets) {
      roomManager.unsubscribe(socket,roomId);
    }

    res.status(200).json({
      message: "Left room successfully",
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function handleGetRooms(req: AuthRequest, res: Response) {
  try {
    const rooms = await getAllRooms();
    res.json({ rooms, message: "Rooms retrieved successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
