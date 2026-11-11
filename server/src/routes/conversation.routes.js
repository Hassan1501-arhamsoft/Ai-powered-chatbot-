import express from "express";

import {
  getConversations,
  getConversation,
} from "../controllers/conversation.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Apply protect to ALL conversation routes — only authenticated users can access them
router.use(protect);

//~ ==========================================
//^ Get all conversations
//~ ==========================================

router.get("/", getConversations);

//~ ==========================================
//^ Get single conversation
//~ ==========================================

router.get("/:conversationId", getConversation);


export default router;