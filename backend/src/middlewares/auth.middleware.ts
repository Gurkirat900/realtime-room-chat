import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt.js";

export interface JwtPayload { // Define the expected structure of the JWT payload
  userId: string;   
}

export interface AuthRequest extends Request {
  user?: JwtPayload;  // Add a user property to the request, which will hold the decoded JWT payload
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;

    // Check Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // Check cookies if no header
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = verifyToken(token) as JwtPayload; // Type assertion for decoded token
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};