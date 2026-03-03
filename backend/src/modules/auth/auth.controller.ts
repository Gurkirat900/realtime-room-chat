import type { Request, Response } from "express";
import * as authService from "./auth.service.js";

export async function signup(req: Request, res: Response) {
  try {
    const result = await authService.signup(req.body);
    res.json(result);
  } catch (err: any) {
    console.error("Signup error:", err);
    res.status(400).json({ error: err.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}