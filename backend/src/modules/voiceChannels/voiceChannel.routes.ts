import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { createVoiceChannelController, getAllVoiceChannels } from "./voiceChannel.controller.js";

const router= Router({mergeParams:true})

router.post("/create",authenticate,createVoiceChannelController)
router.get("/",authenticate,getAllVoiceChannels)

export default router;