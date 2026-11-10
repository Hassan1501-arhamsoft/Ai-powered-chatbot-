import express from "express";
import { chatController } from "../controllers/chat.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Apply the protect middleware so req.user is populated
router.post("/", protect, chatController);

export default router;