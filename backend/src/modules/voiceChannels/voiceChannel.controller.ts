import type { Request, Response } from "express";
import {
  createVoiceChannel,
  getVoiceChannels,
} from "./voiceChannel.service.js";

export async function createVoiceChannelController(
  req: Request,
  res: Response,
) {
  try {
    const roomId = req.params.roomId as string;
    const { name } = req.body;

    const channel = await createVoiceChannel(roomId, name);

    res.json(channel);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getAllVoiceChannels(req: Request, res: Response) {
  try {
    const roomId = req.params.roomId as string;
    const channels = await getVoiceChannels(roomId);

    res.json(channels);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
