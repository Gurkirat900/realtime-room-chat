import { Router } from "express";
import { handleCreateRoom ,handleJoinRoom, handleLeaveRoom, handleGetRooms} from "./room.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/create", authenticate, handleCreateRoom);
router.post("/join", authenticate, handleJoinRoom);
router.post("/leave", authenticate, handleLeaveRoom);
router.get("/", authenticate, handleGetRooms);

export default router;