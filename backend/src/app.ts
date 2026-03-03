import express from "express";
import cookieParser from "cookie-parser";

import authRoutes from "./modules/auth/auth.route.js";

const app = express();

/* Global Middlewares */
app.use(express.json());
app.use(cookieParser());

/* Routes */
app.use("/api/v1/auth", authRoutes);


export default app;