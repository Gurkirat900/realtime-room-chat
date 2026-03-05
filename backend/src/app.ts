import express from "express";
import cookieParser from "cookie-parser";

import authRoutes from "./modules/auth/auth.route.js";
import roomRoutes from "./modules/rooms/room.routes.js";

const app = express();
 
// Middlewares
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/rooms", roomRoutes);


export default app;