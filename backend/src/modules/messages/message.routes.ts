import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { getMessages } from "./message.controller.js";

const router = Router({ mergeParams: true });// mergeParams allows us to access :roomId from parent routes

router.get("/", authenticate, getMessages);

export default router;