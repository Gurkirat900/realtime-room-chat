import type { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import { getRoomMessages } from "./message.service.js";

export const getMessages = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const roomId  = req.params.roomId as string;
    const { cursor, limit } = req.query;

    const messages = await getRoomMessages(
      roomId,
      limit ? Number(limit) : 20,
      cursor as string | undefined
    );

    res.json({
      messages,
      nextCursor: messages.length
        ? messages[messages.length - 1]!.id
        : null,
    });

  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      message: "Failed to fetch messages",
    });
  }
};