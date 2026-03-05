import { Router } from "express";
import { handleCreateRoom ,handleJoinRoom, handleLeaveRoom, handleGetRooms} from "./room.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import messageRoutes from "../messages/message.routes.js";

const router = Router();

router.post("/create", authenticate, handleCreateRoom);
router.post("/join", authenticate, handleJoinRoom);
router.post("/leave", authenticate, handleLeaveRoom);
router.get("/", authenticate, handleGetRooms);

router.use("/:roomId/messages", authenticate, messageRoutes);

export default router;