import { Router } from "express";
import { signup, login } from "./auth.controller.js";
import { validateBody } from "../../middlewares/validateBody.middleware.js";
import { authSchemas } from "../../schemas/auth.schema.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/signup",validateBody(authSchemas.signup), signup);
router.post("/login",validateBody(authSchemas.login), login);

export default router;